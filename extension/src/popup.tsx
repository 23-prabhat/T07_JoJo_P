import { useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import type { Analysis } from "../../src/lib/types";

type AnalysisCacheEntry =
  | { status: "loading"; url: string; updatedAt: string }
  | { status: "success"; url: string; updatedAt: string; data: Analysis }
  | { status: "error"; url: string; updatedAt: string; message: string };

type PopupState = {
  tabId: number | null;
  tabUrl: string;
  entry: AnalysisCacheEntry | null;
  isLoading: boolean;
  loadError: string | null;
};

function PopupApp() {
  const [state, setState] = useState<PopupState>({
    tabId: null,
    tabUrl: "",
    entry: null,
    isLoading: true,
    loadError: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = activeTab?.id ?? null;
        const tabUrl = activeTab?.url ?? "";

        if (!isMounted) {
          return;
        }

        if (!tabId) {
          setState({
            tabId: null,
            tabUrl,
            entry: null,
            isLoading: false,
            loadError: "No active tab was found.",
          });
          return;
        }

        const key = getStorageKey(tabId);
        const stored = await chrome.storage.session.get(key);
        const entry = (stored[key] as AnalysisCacheEntry | undefined) ?? null;

        if (!isMounted) {
          return;
        }

        setState({
          tabId,
          tabUrl,
          entry: isMatchingUrl(entry, tabUrl) ? entry : null,
          isLoading: false,
          loadError: null,
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setState({
          tabId: null,
          tabUrl: "",
          entry: null,
          isLoading: false,
          loadError: "The popup could not read the current tab state.",
        });
      }
    };

    const handleStorageChange = (
      changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName !== "session") {
        return;
      }

      setState((currentState) => {
        if (currentState.tabId === null) {
          return currentState;
        }

        const change = changes[getStorageKey(currentState.tabId)];
        if (!change) {
          return currentState;
        }

        const nextEntry = (change.newValue as AnalysisCacheEntry | undefined) ?? null;
        return {
          ...currentState,
          entry: isMatchingUrl(nextEntry, currentState.tabUrl) ? nextEntry : null,
          isLoading: false,
        };
      });
    };

    void initialize();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const triggerAnalysis = async () => {
    setState((currentState) => ({
      ...currentState,
      entry: {
        status: "loading",
        url: currentState.tabUrl,
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      loadError: null,
    }));

    try {
      await chrome.runtime.sendMessage({ type: "TRIGGER_ANALYSIS" });
    } catch {
      setState((currentState) => ({
        ...currentState,
        entry: {
          status: "error",
          url: currentState.tabUrl,
          updatedAt: new Date().toISOString(),
          message: "The extension could not start the page analysis.",
        },
      }));
    }
  };

  const result = state.entry?.status === "success" ? state.entry.data : null;
  const errorMessage = state.entry?.status === "error" ? state.entry.message : state.loadError;
  const unsupported = state.tabUrl.length > 0 && !/^https?:\/\//.test(state.tabUrl);

  return (
    <div style={styles.shell}>
      <style>{popupStyles}</style>
      <div style={styles.panel}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>Hack for Impact</p>
          <h1 style={styles.title}>Chrome Extension</h1>
          <p style={styles.subtitle}>
            Analyze the current page before anyone agrees to financial terms.
          </p>
        </div>

        {state.isLoading ? (
          <LoadingState />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={triggerAnalysis} />
        ) : result ? (
          <ResultState result={result} onOpenSidebar={triggerAnalysis} />
        ) : (
          <EmptyState onAnalyze={triggerAnalysis} unsupported={unsupported} />
        )}

        {state.entry?.status === "loading" ? (
          <div className="statusCard">
            <div className="spinner" aria-hidden="true" />
            <p className="statusText">Analyzing...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="statusCard">
      <div className="spinner" aria-hidden="true" />
      <p className="statusText">Loading current tab...</p>
    </div>
  );
}

function EmptyState({
  onAnalyze,
  unsupported,
}: {
  onAnalyze: () => Promise<void>;
  unsupported: boolean;
}) {
  return (
    <div className="card">
      <p className="sectionLabel">Current page</p>
      <p className="bodyText">
        {unsupported
          ? "Open a regular http or https page to analyze it."
          : "No analysis is stored for this tab yet."}
      </p>
      <button className="primaryButton" onClick={() => void onAnalyze()} disabled={unsupported}>
        Analyze this page
      </button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="card errorCard">
      <p className="sectionLabel">Analysis error</p>
      <p className="bodyText">{message}</p>
      <button className="primaryButton" onClick={() => void onRetry()}>
        Try again
      </button>
    </div>
  );
}

function ResultState({
  result,
  onOpenSidebar,
}: {
  result: Analysis;
  onOpenSidebar: () => Promise<void>;
}) {
  return (
    <>
      <div className="scoreCard">
        <div>
          <p className="sectionLabel">Risk score</p>
          <div className="scoreLine">
            <span className="scoreValue">{result.riskScore}</span>
            <span className="scoreTotal">/100</span>
          </div>
        </div>
        <span className={`riskBadge risk-${result.riskLevel}`}>{result.riskLevel}</span>
      </div>

      <div className="card">
        <p className="sectionLabel">Summary</p>
        <p className="bodyText">{getOneLineSummary(result.summary)}</p>
      </div>

      <button className="primaryButton" onClick={() => void onOpenSidebar()}>
        Open Sidebar
      </button>
    </>
  );
}

function getStorageKey(tabId: number) {
  return `analysis_${tabId}`;
}

function isMatchingUrl(entry: AnalysisCacheEntry | null, url: string) {
  return Boolean(entry && entry.url === url);
}

function getOneLineSummary(summary: string) {
  const normalized = summary.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.split(/(?<=[.!?])\s/)[0];
  const oneLine = firstSentence || normalized;
  return oneLine.length <= 140 ? oneLine : `${oneLine.slice(0, 139).trimEnd()}…`;
}

const popupStyles = `
  :root {
    color-scheme: light;
  }

  body {
    margin: 0;
    width: 320px;
    min-height: 480px;
    background: linear-gradient(180deg, #fffaf1 0%, #f3e7d3 100%);
    font-family: "Segoe UI", Arial, sans-serif;
  }

  .card,
  .scoreCard,
  .statusCard {
    border: 1px solid #ddc7a7;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    padding: 16px;
  }

  .scoreCard {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .statusCard {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .errorCard {
    border-color: #e8bdbd;
    background: #fff7f7;
  }

  .sectionLabel {
    margin: 0 0 8px;
    color: #7b5d35;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bodyText,
  .statusText {
    margin: 0;
    color: #342719;
    font-size: 14px;
    line-height: 1.6;
  }

  .primaryButton {
    border: 0;
    border-radius: 14px;
    background: #8a5b21;
    color: #fffaf1;
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .primaryButton:hover {
    background: #6f4718;
  }

  .primaryButton:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .scoreLine {
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .scoreValue {
    font-size: 38px;
    line-height: 1;
    font-weight: 800;
    color: #2b2116;
  }

  .scoreTotal {
    color: #7b5d35;
    font-size: 16px;
    font-weight: 700;
  }

  .riskBadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
  }

  .risk-low {
    background: #dff5df;
    color: #166534;
  }

  .risk-medium {
    background: #fff2cc;
    color: #a16207;
  }

  .risk-high {
    background: #ffd9b8;
    color: #c2410c;
  }

  .risk-critical {
    background: #ffe0e0;
    color: #b91c1c;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 3px solid #eadcc0;
    border-top-color: #8a5b21;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const styles: Record<string, CSSProperties> = {
  shell: {
    width: 320,
    minHeight: 480,
  },
  panel: {
    display: "flex",
    minHeight: 480,
    flexDirection: "column",
    gap: 16,
    padding: 18,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  eyebrow: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#8a5b21",
  },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.1,
    color: "#2b2116",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: "#5d4a33",
  },
};

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<PopupApp />);
}
