import type { AnalyzeRequest } from './types'

const READING_LEVEL_INSTRUCTIONS: Record<NonNullable<AnalyzeRequest['readingLevel']>, string> = {
  eli5: 'Explain everything as if the reader is a child aged 5–8. Use the simplest possible words. Avoid all jargon.',
  simple: 'Explain at a 6th-grade reading level. Short sentences, everyday words, no legal or financial jargon.',
  standard: 'Explain at an adult reading level. Clear and direct, some technical terms are fine if briefly explained.',
  expert: 'Assume the reader is a legal or financial professional. Full technical precision, no over-simplification.',
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond entirely in English.',
  hi: 'Respond entirely in Hindi (Devanagari script). All text including JSON string values must be in Hindi.',
  mr: 'Respond entirely in Marathi (Devanagari script). All text including JSON string values must be in Marathi.',
}

export function buildAnalysisPrompt(
  text: string,
  language: string = 'en',
  readingLevel: NonNullable<AnalyzeRequest['readingLevel']> = 'simple'
): string {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en
  const levelInstruction = READING_LEVEL_INSTRUCTIONS[readingLevel]

  return `You are a financial document protection AI. Analyze the following legal/financial document and return a JSON object.

LANGUAGE: ${langInstruction}
READING LEVEL: ${levelInstruction}

DOCUMENT TEXT:
---
${text}
---

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, just raw JSON):

{
  "summary": "2–3 paragraph plain-language summary of what this document is and what the user is agreeing to",
  "riskScore": <integer 0-100, where 0=no risk, 100=extremely dangerous>,
  "riskLevel": <"low"|"medium"|"high"|"critical">,
  "keyObligations": [
    "Obligation 1 — what the user must do or is agreeing to",
    "Obligation 2",
    "Obligation 3"
  ],
  "hiddenClauses": [
    {
      "text": "exact or near-exact quote of the problematic clause from the document",
      "explanation": "plain-language explanation of why this clause is concerning",
      "severity": <"low"|"medium"|"high"|"critical">,
      "category": "e.g. Auto-renewal, Data sharing, Arbitration clause, Liability waiver, Hidden fee"
    }
  ],
  "quiz": [
    {
      "question": "A comprehension question about a key term or obligation in this document",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": <0-3>
    },
    {
      "question": "Second question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": <0-3>
    },
    {
      "question": "Third question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": <0-3>
    }
  ]
}

Rules:
- riskScore thresholds: 0–30 = low, 31–60 = medium, 61–80 = high, 81–100 = critical. riskLevel must match.
- hiddenClauses: include 2–6 clauses. Focus on clauses that could surprise or harm the user.
- keyObligations: 3–6 bullet strings, starting with an action verb.
- quiz: exactly 3 questions, each with exactly 4 options, testing real understanding of this document.
- All text values in the JSON must be in the language specified above.
- Return ONLY the JSON object. No preamble, no explanation, no markdown fences.`
}

export function buildBotSummaryPrompt(text: string, language: string = 'en'): string {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en

  return `You are a financial document protection AI. Analyze this document and reply in a SHORT format for a chat message.

LANGUAGE: ${langInstruction}

DOCUMENT:
---
${text}
---

Return ONLY a JSON object:
{
  "riskScore": <integer 0-100>,
  "riskLevel": <"low"|"medium"|"high"|"critical">,
  "summary": "1–2 sentence plain-language summary",
  "topWarnings": ["Warning 1", "Warning 2", "Warning 3"]
}

No markdown, no code fences, raw JSON only.`
}
