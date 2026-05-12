import type { AnalyzeRequest } from "@/lib/types";

const READING_LEVEL_INSTRUCTIONS: Record<NonNullable<AnalyzeRequest["readingLevel"]>, string> = {
  eli5: "Use very simple words a child can understand.",
  simple: "6th-grade reading level, no jargon.",
  standard: "Clear adult language, brief explanations of technical terms.",
  expert: "Full legal/financial precision.",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "English",
  hi: "Hindi (Devanagari)",
  mr: "Marathi (Devanagari)",
};

export function buildAnalysisPrompt(
  text: string,
  language: string = "en",
  readingLevel: NonNullable<AnalyzeRequest["readingLevel"]> = "simple",
): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en;
  const level = READING_LEVEL_INSTRUCTIONS[readingLevel];

  return `Analyze the document below and produce a grounded legal/financial summary. Output language: ${lang}. Reading level: ${level}.

DOCUMENT:
${text}

Return ONLY raw JSON (no markdown, no fences):
{"summary":"2-3 paragraph plain-language summary","riskScore":0,"riskLevel":"low","keyObligations":["..."],"hiddenClauses":[{"text":"quote","explanation":"why concerning","severity":"low","category":"type"}],"quiz":[{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}

Rules:
- Use only facts directly supported by the document text.
- If the visible text is incomplete, summarize only what is visible and avoid guessing.
- Do not mention privacy, scams, arbitration, auto-renewal, hidden fees, data sharing, or penalties unless the document text supports it.
- Keep the summary specific to this document, not generic safety advice.
- summary max 3 short sentences.
- riskScore 0-30=low,31-60=medium,61-80=high,81-100=critical. riskLevel must match.
- Exactly 3 keyObligations. Each must be short, specific, and start with a verb.
- Up to 3 hiddenClauses. Use an empty array if nothing concerning is visible.
- Exactly 3 quiz questions with 4 short options each. Questions must be answerable from the document text.
- All values in ${lang}.
- JSON only.`
}

export function buildBotSummaryPrompt(text: string, language: string = "en"): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en;

  return `Analyze this document. Output language: ${lang}.

DOCUMENT:
${text}

Return ONLY raw JSON: {"riskScore":0,"riskLevel":"low","summary":"1-2 sentences","topWarnings":["...","...","..."]}`;
}
