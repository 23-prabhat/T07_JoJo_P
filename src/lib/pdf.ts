export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2 exports a class-based API: new PDFParse({ data }) → .getText()
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  if (result.text && result.text.trim().length >= 50) {
    return result.text.trim()
  }
  throw new Error('No extractable text found. Please upload a selectable-text PDF.')
}

export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf8').trim()
}
