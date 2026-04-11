import type { Analysis, AnalyzeRequest } from "@/lib/types";

export async function analyzeDocument(_request: AnalyzeRequest): Promise<Analysis> {
  throw new Error("Analysis orchestration not implemented yet.");
}
