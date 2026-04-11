export async function extractTextFromPDF(_buffer: Buffer): Promise<string> {
  throw new Error("PDF extraction not implemented yet.");
}

export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return buffer.toString("utf8");
}
