import { NextRequest } from 'next/server'
import { extractTextFromPDF, extractTextFromTXT } from '@/lib/pdf'

export const runtime = 'nodejs'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return Response.json({ error: 'File exceeds 10MB limit.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const name = file.name.toLowerCase()

    let text: string

    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      text = await extractTextFromPDF(buffer)
    } else if (name.endsWith('.txt') || file.type === 'text/plain') {
      text = extractTextFromTXT(buffer)
    } else {
      return Response.json(
        { error: 'Unsupported file type. Upload a PDF or TXT file.' },
        { status: 400 }
      )
    }

    if (!text || text.trim().length < 20) {
      return Response.json(
        { error: 'No usable text found in file.' },
        { status: 400 }
      )
    }

    return Response.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to extract text from file.'
    return Response.json({ error: message }, { status: 500 })
  }
}
