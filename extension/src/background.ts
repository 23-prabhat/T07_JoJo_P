import type { Analysis } from "../../src/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

type TriggerAnalysisMessage = { type: "TRIGGER_ANALYSIS" };
type AnalyzeRequestMessage = { type: "ANALYZE_REQUEST"; text: string; url: string };
type AnalysisResultMessage = { type: "ANALYSIS_RESULT"; data: Analysis };
type AnalysisErrorMessage = { type: "ANALYSIS_ERROR"; message: string };

type RuntimeMessage =
  | TriggerAnalysisMessage
  | AnalyzeRequestMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage;

type AnalysisCacheEntry =
  | { status: "loading"; url: string; updatedAt: string }
  | { status: "success"; url: string; updatedAt: string; data: Analysis }
  | { status: "error"; url: string; updatedAt: string; message: string };

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender: { tab?: { id?: number; url?: string } }) => {
  if (message.type === "TRIGGER_ANALYSIS") {
    void handleTriggerFromPopup();
    return false;
  }

  if (message.type === "ANALYZE_REQUEST") {
    void handleAnalyzeRequest(message, sender.tab?.id);
    return false;
  }

  if (message.type === "ANALYSIS_ERROR") {
    void handleContentError(message, sender.tab?.id, sender.tab?.url);
    return false;
  }

  return false;
});

async function handleTriggerFromPopup() {
  const activeTab = await getActiveTab();
  if (!activeTab?.id) {
    return;
  }

  if (!isSupportedUrl(activeTab.url)) {
    await setAnalysisState(activeTab.id, {
      status: "error",
      url: activeTab.url ?? "",
      updatedAt: new Date().toISOString(),
      message: "This extension only works on regular http and https pages.",
    });
    return;
  }

  const existingEntry = await getAnalysisState(activeTab.id);
  if (!existingEntry || existingEntry.url !== activeTab.url || existingEntry.status !== "success") {
    await setAnalysisState(activeTab.id, {
      status: "loading",
      url: activeTab.url,
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, { type: "TRIGGER_ANALYSIS" } satisfies TriggerAnalysisMessage);
  } catch {
    await setAnalysisState(activeTab.id, {
      status: "error",
      url: activeTab.url,
      updatedAt: new Date().toISOString(),
      message: "The page is not ready for analysis yet. Refresh the tab and try again.",
    });
  }
}

async function handleAnalyzeRequest(message: AnalyzeRequestMessage, tabId?: number) {
  if (!tabId) {
    return;
  }

  const cachedEntry = await getAnalysisState(tabId);
  if (cachedEntry?.status === "success" && cachedEntry.url === message.url) {
    await sendMessageToTab(tabId, {
      type: "ANALYSIS_RESULT",
      data: cachedEntry.data,
    });
    return;
  }

  await setAnalysisState(tabId, {
    status: "loading",
    url: message.url,
    updatedAt: new Date().toISOString(),
  });

  try {
    if (!API_BASE_URL) {
      throw new Error("The extension API URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message.text,
        language: "en",
        readingLevel: "simple",
        source: "extension",
      }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload));
    }

    if (!isAnalysis(payload)) {
      throw new Error("The analysis response was not in the expected format.");
    }

    const state: AnalysisCacheEntry = {
      status: "success",
      url: message.url,
      updatedAt: new Date().toISOString(),
      data: payload,
    };

    await setAnalysisState(tabId, state);
    await sendMessageToTab(tabId, { type: "ANALYSIS_RESULT", data: payload });
  } catch (error) {
    const messageText = getAnalyzeFailureMessage(error);

    await handleFailure(tabId, message.url, messageText);
  }
}

async function handleContentError(
  message: AnalysisErrorMessage,
  tabId?: number,
  url?: string,
) {
  if (!tabId) {
    return;
  }

  await handleFailure(tabId, url ?? "", message.message);
}

async function handleFailure(tabId: number, url: string, message: string) {
  await setAnalysisState(tabId, {
    status: "error",
    url,
    updatedAt: new Date().toISOString(),
    message,
  });

  await sendMessageToTab(tabId, { type: "ANALYSIS_ERROR", message });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendMessageToTab(tabId: number, message: RuntimeMessage) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return;
  }
}

function getStorageKey(tabId: number) {
  return `analysis_${tabId}`;
}

async function getAnalysisState(tabId: number): Promise<AnalysisCacheEntry | null> {
  const key = getStorageKey(tabId);
  const data = await chrome.storage.session.get(key);
  return (data[key] as AnalysisCacheEntry | undefined) ?? null;
}

async function setAnalysisState(tabId: number, state: AnalysisCacheEntry) {
  const key = getStorageKey(tabId);
  await chrome.storage.session.set({ [key]: state });
}

function isSupportedUrl(url?: string): url is string {
  return Boolean(url && /^https?:\/\//.test(url));
}

function getApiErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return "The API returned an error while analyzing this page.";
}

function isAnalysis(value: unknown): value is Analysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const analysis = value as Record<string, unknown>;
  return (
    typeof analysis.summary === "string" &&
    typeof analysis.riskScore === "number" &&
    isRiskLevel(analysis.riskLevel) &&
    Array.isArray(analysis.keyObligations) &&
    Array.isArray(analysis.hiddenClauses) &&
    Array.isArray(analysis.quiz) &&
    typeof analysis.language === "string" &&
    typeof analysis.auditId === "string" &&
    typeof analysis.createdAt === "string"
  );
}

function isRiskLevel(value: unknown): value is Analysis["riskLevel"] {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

function getAnalyzeFailureMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong while analyzing this page.";
  }

  if (error.message === "Failed to fetch") {
    return `The extension could not reach ${API_BASE_URL}/api/analyze. Start the web app and reload the extension.`;
  }

  return error.message;
}
