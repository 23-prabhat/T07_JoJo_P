import type { AnalyzeRequest } from "@/lib/types";

const READING_LEVEL_INSTRUCTIONS: Record<NonNullable<AnalyzeRequest["readingLevel"]>, string> = {
  eli5: "Explain everything as if the reader is a child aged 5-8. Use very simple words and avoid jargon.",
  simple: "Explain at about a 6th-grade reading level using short sentences and everyday words.",
  standard: "Explain at an adult reading level with clear direct wording and brief term explanations.",
  expert: "Assume the reader is a legal or financial professional and keep full technical precision.",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "Respond entirely in English.",
  hi: "Respond entirely in Hindi (Devanagari script).",
  mr: "Respond entirely in Marathi (Devanagari script).",
};

export function buildAnalysisPrompt(
  text: string,
  language: string = "en",
  readingLevel: NonNullable<AnalyzeRequest["readingLevel"]> = "simple",
): string {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en;
  const levelInstruction = READING_LEVEL_INSTRUCTIONS[readingLevel];

  return `You are a financial document protection AI. Analyze the following document and return ONLY raw JSON.

LANGUAGE: ${languageInstruction}
READING LEVEL: ${levelInstruction}

DOCUMENT:
---
${text}
---

Return this exact JSON shape:
{
  "summary": "string",
  "riskScore": 0,
  "riskLevel": "low",
  "keyObligations": ["string"],
  "hiddenClauses": [
    {
      "text": "string",
      "explanation": "string",
      "severity": "low",
      "category": "string"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}

Rules:
- riskScore must be an integer from 0 to 100.
- riskLevel must match riskScore bands: 0-30 low, 31-60 medium, 61-80 high, 81-100 critical.
- Provide 3-6 keyObligations.
- Provide 2-6 hiddenClauses.
- Provide exactly 3 quiz items, each with 4 options.
- Output JSON only with no markdown or code fences.`;
}

export function buildBotSummaryPrompt(text: string, language: string = "en"): string {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en;

  return `You are a financial document protection AI. Return ONLY raw JSON in the requested language.

LANGUAGE: ${languageInstruction}

DOCUMENT:
---
${text}
---

Return this JSON object only:
{
  "riskScore": 0,
  "riskLevel": "low",
  "summary": "string",
  "topWarnings": ["string", "string", "string"]
}`;
}
