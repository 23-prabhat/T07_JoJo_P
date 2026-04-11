import { v4 as uuidv4 } from 'uuid'
import { generateContent } from './gemini'
import { buildAnalysisPrompt } from './prompts'
import type { Analysis, AnalyzeRequest } from './types'

const MAX_TEXT_CHARS = 4_000

export async function analyze(req: AnalyzeRequest): Promise<Analysis> {
  const text = req.text.slice(0, MAX_TEXT_CHARS)
  const language = req.language ?? 'en'
  const readingLevel = req.readingLevel ?? 'simple'

  const prompt = buildAnalysisPrompt(text, language, readingLevel)

  const raw = (await generateContent(prompt)).trim()

  // Extract the JSON object robustly — find first { and last }
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    console.error('Raw AI response:', raw.slice(0, 500))
    throw new Error('AI returned malformed JSON. Please try again.')
  }
  const cleaned = raw.slice(start, end + 1)

  let parsed: Omit<Analysis, 'auditId' | 'createdAt' | 'language'>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse JSON:', cleaned.slice(0, 500))
    throw new Error('AI returned malformed JSON. Please try again.')
  }

  // Clamp and validate riskScore
  const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)))

  return {
    summary: parsed.summary ?? '',
    riskScore,
    riskLevel: parsed.riskLevel ?? scoreToLevel(riskScore),
    keyObligations: Array.isArray(parsed.keyObligations) ? parsed.keyObligations : [],
    hiddenClauses: Array.isArray(parsed.hiddenClauses) ? parsed.hiddenClauses : [],
    quiz: Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 3) : [],
    language,
    auditId: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

function scoreToLevel(score: number): Analysis['riskLevel'] {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  if (score <= 80) return 'high'
  return 'critical'
}
