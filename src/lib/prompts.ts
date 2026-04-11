import type { AnalyzeRequest } from './types'

const READING_LEVEL_INSTRUCTIONS: Record<NonNullable<AnalyzeRequest['readingLevel']>, string> = {
  eli5: 'Use very simple words a child can understand.',
  simple: '6th-grade reading level, no jargon.',
  standard: 'Clear adult language, brief explanations of technical terms.',
  expert: 'Full legal/financial precision.',
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari)',
  mr: 'Marathi (Devanagari)',
}

export function buildAnalysisPrompt(
  text: string,
  language: string = 'en',
  readingLevel: NonNullable<AnalyzeRequest['readingLevel']> = 'simple'
): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'
  const level = READING_LEVEL_INSTRUCTIONS[readingLevel]

  return `Analyze this legal/financial document. Output language: ${lang}. Reading level: ${level}.

DOCUMENT:
${text}

Return ONLY raw JSON (no markdown, no fences):
{"summary":"2-3 paragraph plain-language summary","riskScore":0,"riskLevel":"low","keyObligations":["..."],"hiddenClauses":[{"text":"quote","explanation":"why concerning","severity":"low","category":"type"}],"quiz":[{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0},{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}

Rules: riskScore 0-30=low,31-60=medium,61-80=high,81-100=critical. riskLevel must match. Exactly 2 hiddenClauses. Exactly 3 keyObligations (short, starting with a verb). Exactly 3 quiz questions with 4 short options each. summary max 3 sentences. All values in ${lang}. Be concise.`
}

export function buildBotSummaryPrompt(text: string, language: string = 'en'): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? 'English'

  return `Analyze this document. Output language: ${lang}.

DOCUMENT:
${text}

Return ONLY raw JSON: {"riskScore":0,"riskLevel":"low","summary":"1-2 sentences","topWarnings":["...","...","..."]}`
}
