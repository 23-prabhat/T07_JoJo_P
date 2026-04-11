import type { AnalyzeRequest } from "@/lib/types";

export function buildAnalysisPrompt(request: AnalyzeRequest) {
  return request;
}

export function buildQuizPrompt(text: string) {
  return text;
}

export function buildBotSummaryPrompt(text: string, language: string) {
  return { text, language };
}
