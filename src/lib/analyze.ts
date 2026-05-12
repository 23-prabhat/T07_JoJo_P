import { v4 as uuidv4 } from "uuid";
import { generateContent } from "./gemini";
import { buildAnalysisPrompt } from "./prompts";
import type { Analysis, AnalyzeRequest } from "./types";

const MAX_TEXT_CHARS = 4_000;
const MIN_TOKEN_LENGTH = 4;
const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "agree",
  "agreement",
  "allow",
  "allows",
  "before",
  "being",
  "between",
  "could",
  "document",
  "from",
  "have",
  "into",
  "legal",
  "must",
  "page",
  "payment",
  "policy",
  "terms",
  "that",
  "their",
  "there",
  "these",
  "this",
  "those",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your",
]);

export async function analyze(request: AnalyzeRequest): Promise<Analysis> {
  const text = normalizeDocumentText(request.text).slice(0, MAX_TEXT_CHARS);
  const language = request.language ?? "en";
  const readingLevel = request.readingLevel ?? "simple";

  const prompt = buildAnalysisPrompt(text, language, readingLevel);
  const raw = normalizeGeneratedText((await generateContent(prompt)).trim());

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    console.error("Raw AI response:", raw.slice(0, 500));
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  const cleaned = raw.slice(start, end + 1);

  let parsed: Omit<Analysis, "auditId" | "createdAt" | "language">;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse JSON:", cleaned.slice(0, 500));
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)));
  const hiddenClauses = sanitizeClauses(parsed.hiddenClauses, text);
  const keyObligations = sanitizeKeyObligations(parsed.keyObligations, text);
  const summary = buildGroundedSummary(parsed.summary, text, hiddenClauses, keyObligations);

  return {
    summary,
    riskScore,
    riskLevel: parsed.riskLevel ?? scoreToLevel(riskScore),
    keyObligations,
    hiddenClauses,
    quiz: sanitizeQuiz(parsed.quiz, text),
    language,
    auditId: uuidv4(),
    createdAt: new Date().toISOString(),
  };
}

function scoreToLevel(score: number): Analysis["riskLevel"] {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

function normalizeDocumentText(text: string): string {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeGeneratedText(text: string): string {
  return text
    .replace(/â€¦/g, "...")
    .replace(/â€“|â€”/g, "-")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/\uFFFD/g, "")
    .trim();
}

function sanitizeTextField(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return normalizeGeneratedText(value).replace(/\s+/g, " ").trim();
}

function sanitizeKeyObligations(value: unknown, sourceText: string): string[] {
  if (!Array.isArray(value)) {
    return extractFallbackObligations(sourceText);
  }

  const cleaned = value
    .map((item) => sanitizeTextField(item))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .filter((item) => hasSourceOverlap(item, sourceText))
    .slice(0, 3);

  return cleaned.length === 3 ? cleaned : extractFallbackObligations(sourceText, cleaned);
}

function sanitizeClauses(value: unknown, sourceText: string): Analysis["hiddenClauses"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const clause = item as Record<string, unknown>;
      const text = sanitizeTextField(clause.text);
      const explanation = sanitizeTextField(clause.explanation);
      const category = sanitizeTextField(clause.category) || "Flagged clause";
      const severity = sanitizeSeverity(clause.severity);

      if (!text || !explanation || !hasSourceOverlap(text, sourceText)) {
        return [];
      }

      return [{ text, explanation, category, severity }];
    })
    .slice(0, 3);
}

function sanitizeQuiz(value: unknown, sourceText: string): Analysis["quiz"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const question = item as Record<string, unknown>;
      const prompt = sanitizeTextField(question.question);
      const options = Array.isArray(question.options)
        ? question.options.map((option) => sanitizeTextField(option)).filter(Boolean).slice(0, 4)
        : [];
      const correctIndex =
        typeof question.correctIndex === "number" ? Math.trunc(question.correctIndex) : -1;

      if (!prompt || options.length !== 4 || correctIndex < 0 || correctIndex > 3) {
        return [];
      }

      if (!hasSourceOverlap(prompt, sourceText)) {
        return [];
      }

      return [{ question: prompt, options, correctIndex }];
    })
    .slice(0, 3);
}

function sanitizeSeverity(value: unknown): Analysis["riskLevel"] {
  return value === "low" || value === "medium" || value === "high" || value === "critical"
    ? value
    : "medium";
}

function buildGroundedSummary(
  candidate: unknown,
  sourceText: string,
  clauses: Analysis["hiddenClauses"],
  obligations: string[],
): string {
  const normalizedCandidate = sanitizeTextField(candidate);
  if (normalizedCandidate && isUsefulSummary(normalizedCandidate, sourceText)) {
    return normalizedCandidate;
  }

  const fallbackSentences = extractImportantSentences(sourceText, 2);
  const obligationLine =
    obligations.length > 0
      ? `You agree to ${obligations
          .map((item) => item.replace(/^[A-Z]/, (match) => match.toLowerCase()))
          .join(", ")}.`
      : "";
  const riskLine =
    clauses.length > 0
      ? `Watch for ${clauses[0].category.toLowerCase()}: ${clauses[0].explanation}`
      : "No clear high-risk clause was confidently identified from the visible text.";

  return [fallbackSentences.join(" "), obligationLine, riskLine]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulSummary(summary: string, sourceText: string): boolean {
  if (summary.length < 40) {
    return false;
  }

  if (/(lorem ipsum|asdf|gibberish|n\/a)/i.test(summary)) {
    return false;
  }

  return hasSourceOverlap(summary, sourceText, 2);
}

function hasSourceOverlap(candidate: string, sourceText: string, minimumMatches: number = 1): boolean {
  const sourceTokens = new Set(extractKeywords(sourceText));
  let matches = 0;

  for (const token of extractKeywords(candidate)) {
    if (!sourceTokens.has(token)) {
      continue;
    }

    matches += 1;
    if (matches >= minimumMatches) {
      return true;
    }
  }

  return false;
}

function extractKeywords(text: string): string[] {
  return normalizeDocumentText(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH)
    .filter((token) => !STOP_WORDS.has(token));
}

function extractImportantSentences(text: string, maxSentences: number): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40);

  const prioritized = sentences
    .map((sentence) => ({
      sentence,
      score: scoreSentence(sentence),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((entry) => entry.sentence);

  return prioritized.length > 0 ? prioritized : sentences.slice(0, maxSentences);
}

function scoreSentence(sentence: string): number {
  const keywordBoost = extractKeywords(sentence).length;
  const riskBoost = /(fee|charge|cancel|renew|share|data|liable|penalty|consent|authorize|payment)/i.test(
    sentence,
  )
    ? 4
    : 0;

  return keywordBoost + riskBoost;
}

function extractFallbackObligations(sourceText: string, seed: string[] = []): string[] {
  const results = [...seed];
  const sentences = extractImportantSentences(sourceText, 6);

  for (const sentence of sentences) {
    if (results.length >= 3) {
      break;
    }

    const obligation = sentenceToObligation(sentence);
    if (!obligation || results.includes(obligation)) {
      continue;
    }

    results.push(obligation);
  }

  while (results.length < 3) {
    results.push("Review the visible terms carefully");
  }

  return results.slice(0, 3);
}

function sentenceToObligation(sentence: string): string {
  const cleaned = sentence
    .replace(/^[^a-zA-Z0-9]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  const shortened = cleaned.length <= 90 ? cleaned : `${cleaned.slice(0, 89).trimEnd()}...`;
  return /^[A-Z]/.test(shortened) ? shortened : shortened.charAt(0).toUpperCase() + shortened.slice(1);
}
