"use client";

import { CheckCircle } from "@phosphor-icons/react";

interface PlainSummaryProps {
  summary: string;
  keyObligations: string[];
}

export function PlainSummary({ summary, keyObligations }: PlainSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {summary.split("\n").filter(Boolean).map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/80">
            {para}
          </p>
        ))}
      </div>

      {keyObligations.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What you&apos;re agreeing to
          </p>
          <ul className="space-y-2">
            {keyObligations.map((obligation, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-warm"
                />
                <span className="text-sm text-foreground/80">{obligation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
