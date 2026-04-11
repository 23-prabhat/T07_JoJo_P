export interface Clause {
  text: string
  explanation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export interface Analysis {
  summary: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  keyObligations: string[]
  hiddenClauses: Clause[]
  quiz: QuizQuestion[]
  language: string
  auditId: string
  createdAt: string
}

export interface AnalyzeRequest {
  text: string
  language?: string
  readingLevel?: 'eli5' | 'simple' | 'standard' | 'expert'
  source?: 'web' | 'extension' | 'bot'
}
