import type { Analysis } from "@/lib/types";

export function getRiskLevel(score: number): Analysis["riskLevel"] {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "critical";
}
