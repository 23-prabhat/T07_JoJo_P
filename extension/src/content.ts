import type { Analysis } from "../../src/lib/types";

const MAX_TEXT_LENGTH = 8000;
const MIN_TEXT_LENGTH = 200;
const SIDEBAR_HOST_ID = "hack-for-impact-extension-root";
const SELECTOR_PRIORITY = [
  '[data-testid*="terms"]',
  '[class*="terms"]',
  '[class*="consent"]',
  '[class*="legal"]',
  '[class*="agreement"]',
  "article",
  "main",
  "body",
] as const;

type RuntimeMessage =
  | { type: "TRIGGER_ANALYSIS" }
  | { type: "ANALYZE_REQUEST"; text: string; url: string }
  | { type: "ANALYSIS_RESULT"; data: Analysis }
  | { type: "ANALYSIS_ERROR"; message: string };

type SidebarState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Analysis }
  | { status: "error"; message: string };

type SidebarController = {
  host: HTMLDivElement;
  container: HTMLDivElement;
  render: (state: SidebarState) => void;
  open: () => void;
  close: () => void;
};

let sidebarController: SidebarController | null = null;
let currentPageState: SidebarState = { status: "idle" };
let analyzedUrl: string | null = null;

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "TRIGGER_ANALYSIS") {
    handleTriggerAnalysis();
    return;
  }

  if (message.type === "ANALYSIS_RESULT") {
    analyzedUrl = window.location.href;
    currentPageState = { status: "success", data: message.data };
    ensureSidebar().render(currentPageState);
    return;
  }

  if (message.type === "ANALYSIS_ERROR") {
    analyzedUrl = window.location.href;
    currentPageState = { status: "error", message: message.message };
    ensureSidebar().render(currentPageState);
  }
});

function handleTriggerAnalysis() {
  const sidebar = ensureSidebar();
  sidebar.open();

  if (analyzedUrl === window.location.href && currentPageState.status === "success") {
    sidebar.render(currentPageState);
    return;
  }

  if (analyzedUrl === window.location.href && currentPageState.status === "loading") {
    sidebar.render(currentPageState);
    return;
  }

  currentPageState = { status: "loading" };
  analyzedUrl = window.location.href;
  sidebar.render(currentPageState);

  const text = extractRelevantText();
  if (!text) {
    const message = "No likely legal or financial text was found on this page.";
    currentPageState = { status: "error", message };
    sidebar.render(currentPageState);
    void chrome.runtime.sendMessage({ type: "ANALYSIS_ERROR", message } satisfies RuntimeMessage);
    return;
  }

  void chrome.runtime.sendMessage({
    type: "ANALYZE_REQUEST",
    text,
    url: window.location.href,
  } satisfies RuntimeMessage);
}

function extractRelevantText(): string | null {
  for (const selector of SELECTOR_PRIORITY) {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    for (const element of elements) {
      const cleaned = cleanText(element.textContent ?? "");
      if (cleaned.length >= MIN_TEXT_LENGTH) {
        return cleaned.slice(0, MAX_TEXT_LENGTH);
      }
    }
  }

  return null;
}

function cleanText(rawText: string): string {
  return rawText.replace(/\s+/g, " ").trim();
}

function ensureSidebar(): SidebarController {
  if (sidebarController) {
    return sidebarController;
  }

  const existingHost = document.getElementById(SIDEBAR_HOST_ID) as HTMLDivElement | null;
  if (existingHost?.shadowRoot) {
    const existingContainer = existingHost.shadowRoot.getElementById(
      "hack-for-impact-sidebar",
    ) as HTMLDivElement | null;

    if (existingContainer) {
      sidebarController = createSidebarController(existingHost, existingContainer);
      return sidebarController;
    }
  }

  const host = document.createElement("div");
  host.id = SIDEBAR_HOST_ID;
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = getSidebarStyles();

  const container = document.createElement("div");
  container.id = "hack-for-impact-sidebar";
  shadowRoot.append(style, container);

  sidebarController = createSidebarController(host, container);
  return sidebarController;
}

function createSidebarController(host: HTMLDivElement, container: HTMLDivElement): SidebarController {
  const controller: SidebarController = {
    host,
    container,
    render: (state) => renderSidebar(container, state, controller),
    open: () => {
      host.style.display = "block";
    },
    close: () => {
      host.style.display = "none";
    },
  };

  controller.render(currentPageState);
  return controller;
}

function renderSidebar(
  container: HTMLDivElement,
  state: SidebarState,
  controller: SidebarController,
) {
  container.replaceChildren();

  const panel = document.createElement("aside");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "header";

  const titleWrap = document.createElement("div");
  titleWrap.innerHTML = `
    <p class="eyebrow">Hack for Impact</p>
    <h2 class="title">Page Analysis</h2>
  `;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "closeButton";
  closeButton.setAttribute("aria-label", "Close sidebar");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => controller.close());

  header.append(titleWrap, closeButton);
  panel.appendChild(header);

  const content = document.createElement("div");
  content.className = "content";

  if (state.status === "loading") {
    const loadingCard = document.createElement("div");
    loadingCard.className = "loadingCard";
    loadingCard.innerHTML = `
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">Analyzing...</p>
    `;
    content.appendChild(loadingCard);
  }

  if (state.status === "error") {
    const errorCard = document.createElement("div");
    errorCard.className = "errorCard";
    errorCard.innerHTML = `
      <p class="errorTitle">Analysis failed</p>
      <p class="errorMessage">${escapeHtml(state.message)}</p>
    `;
    content.appendChild(errorCard);
  }

  if (state.status === "success") {
    const riskCard = document.createElement("div");
    riskCard.className = "riskCard";
    riskCard.innerHTML = `
      <div>
        <p class="sectionLabel">Risk score</p>
        <p class="score">${state.data.riskScore}<span>/100</span></p>
      </div>
      <span class="riskBadge risk-${state.data.riskLevel}">${escapeHtml(state.data.riskLevel)}</span>
    `;
    content.appendChild(riskCard);

    const summaryCard = document.createElement("section");
    summaryCard.className = "sectionCard";
    summaryCard.innerHTML = `
      <p class="sectionLabel">Plain Summary</p>
      <p class="summaryText">${escapeHtml(shortenText(state.data.summary, 320))}</p>
    `;
    content.appendChild(summaryCard);

    const clausesCard = document.createElement("section");
    clausesCard.className = "sectionCard";

    const clausesTitle = document.createElement("p");
    clausesTitle.className = "sectionLabel";
    clausesTitle.textContent = "Top flagged clauses";
    clausesCard.appendChild(clausesTitle);

    const clausesList = document.createElement("div");
    clausesList.className = "clauses";

    const topClauses = state.data.hiddenClauses.slice(0, 3);
    if (topClauses.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "emptyText";
      emptyState.textContent = "No flagged clauses were returned for this page.";
      clausesList.appendChild(emptyState);
    } else {
      for (const clause of topClauses) {
        const item = document.createElement("article");
        item.className = "clauseItem";
        item.innerHTML = `
          <div class="clauseHeader">
            <span class="clauseCategory">${escapeHtml(clause.category)}</span>
            <span class="severity severity-${clause.severity}">${escapeHtml(clause.severity)}</span>
          </div>
          <p class="clauseExplanation">${escapeHtml(shortenText(clause.explanation, 160))}</p>
          <p class="clauseOriginal">${escapeHtml(shortenText(clause.text, 180))}</p>
        `;
        clausesList.appendChild(item);
      }
    }

    clausesCard.appendChild(clausesList);
    content.appendChild(clausesCard);
  }

  panel.appendChild(content);
  container.appendChild(panel);
}

function shortenText(text: string, maxLength: number): string {
  const normalized = cleanText(text);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSidebarStyles(): string {
  return `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      max-width: min(380px, 100vw);
      height: 100vh;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #fffdf8 0%, #f7efe2 100%);
      border-left: 1px solid #d7c1a2;
      box-shadow: -24px 0 48px rgba(55, 41, 19, 0.14);
      font-family: "Segoe UI", Arial, sans-serif;
      color: #2b2116;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #eadac1;
      background: rgba(255, 252, 245, 0.92);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #8a5b21;
    }

    .title {
      margin: 0;
      font-size: 22px;
      line-height: 1.15;
      font-weight: 700;
    }

    .closeButton {
      border: 1px solid #d0b690;
      background: #fff8ed;
      color: #5a4122;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .closeButton:hover {
      background: #f8ecd8;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .riskCard,
    .sectionCard,
    .loadingCard,
    .errorCard {
      border-radius: 18px;
      border: 1px solid #e4cfb0;
      background: rgba(255, 255, 255, 0.88);
      padding: 16px;
    }

    .riskCard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .sectionLabel {
      margin: 0 0 8px;
      color: #7b5d35;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .score {
      margin: 0;
      font-size: 38px;
      line-height: 1;
      font-weight: 800;
    }

    .score span {
      font-size: 16px;
      color: #7b5d35;
      margin-left: 4px;
    }

    .riskBadge,
    .severity {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }

    .risk-low,
    .severity-low {
      background: #dff5df;
      color: #166534;
    }

    .risk-medium,
    .severity-medium {
      background: #fff2cc;
      color: #a16207;
    }

    .risk-high,
    .severity-high {
      background: #ffd9b8;
      color: #c2410c;
    }

    .risk-critical,
    .severity-critical {
      background: #ffe0e0;
      color: #b91c1c;
    }

    .summaryText,
    .clauseExplanation,
    .clauseOriginal,
    .emptyText,
    .errorMessage,
    .loadingText {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
    }

    .clauses {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .clauseItem {
      border-radius: 14px;
      padding: 14px;
      background: #fffaf1;
      border: 1px solid #eadcc6;
    }

    .clauseHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .clauseCategory {
      font-size: 13px;
      font-weight: 700;
      color: #543b1c;
    }

    .clauseExplanation {
      color: #2f2418;
      margin-bottom: 8px;
    }

    .clauseOriginal {
      color: #73593a;
      font-size: 12px;
    }

    .loadingCard,
    .errorCard {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ecdcc0;
      border-top-color: #8a5b21;
      animation: spin 0.8s linear infinite;
    }

    .errorTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #991b1b;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
}
