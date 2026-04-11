"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

interface ComprehensionQuizProps {
  questions: QuizQuestion[];
  onPass: () => void;
}

type AnswerState = "unanswered" | "correct" | "wrong";

export function ComprehensionQuiz({ questions, onPass }: ComprehensionQuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const states: AnswerState[] = questions.map((q, i) => {
    if (answers[i] === null) return "unanswered";
    return answers[i] === q.correctIndex ? "correct" : "wrong";
  });

  const correctCount = states.filter((s) => s === "correct").length;
  const allAnswered = answers.every((a) => a !== null);
  const passed = submitted && correctCount >= 2;

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (correctCount >= 2) {
      onPass();
    }
  };

  const handleRetry = () => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            <span className="mr-2 font-mono text-warm/60">{qi + 1}.</span>
            {q.question}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = q.correctIndex === oi;
              let optClass =
                "flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition-all duration-150 text-left";

              if (!submitted) {
                optClass = cn(
                  optClass,
                  isSelected
                    ? "border-warm bg-warm/10 text-foreground"
                    : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.03] text-muted-foreground"
                );
              } else {
                if (isCorrect) {
                  optClass = cn(
                    optClass,
                    "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                  );
                } else if (isSelected && !isCorrect) {
                  optClass = cn(
                    optClass,
                    "border-red-500/40 bg-red-500/10 text-red-500"
                  );
                } else {
                  optClass = cn(
                    optClass,
                    "border-foreground/[0.06] text-muted-foreground/50"
                  );
                }
              }

              return (
                <button
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  disabled={submitted}
                  className={optClass}
                >
                  {submitted ? (
                    isCorrect ? (
                      <CheckCircle size={16} weight="fill" className="shrink-0 text-green-500" />
                    ) : isSelected ? (
                      <XCircle size={16} weight="fill" className="shrink-0 text-red-500" />
                    ) : (
                      <span className="size-4 shrink-0 rounded-full border border-foreground/15" />
                    )
                  ) : (
                    <span
                      className={cn(
                        "size-4 shrink-0 rounded-full border transition-colors",
                        isSelected
                          ? "border-warm bg-warm"
                          : "border-foreground/20"
                      )}
                    />
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Result bar */}
      {submitted && (
        <div
          className={cn(
            "rounded-xl border p-4 text-sm font-medium",
            passed
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-500"
          )}
        >
          {passed
            ? `✓ ${correctCount}/3 correct — you're ready to give consent.`
            : `✗ ${correctCount}/3 correct — please review the document and try again.`}
        </div>
      )}

      <div className="flex gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-xl bg-warm px-6 py-3 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Submit answers
          </button>
        ) : !passed ? (
          <button
            onClick={handleRetry}
            className="rounded-xl border border-foreground/15 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-foreground/[0.04] cursor-pointer"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
