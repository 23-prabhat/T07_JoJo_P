import { NextRequest } from 'next/server'
import { analyze } from '@/lib/analyze'
import type { AnalyzeRequest } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 20) {
      return Response.json({ error: 'No valid text provided.' }, { status: 400 })
    }

    const result = await analyze(body)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
    return Response.json({ error: message }, { status: 500 })
  }
}
