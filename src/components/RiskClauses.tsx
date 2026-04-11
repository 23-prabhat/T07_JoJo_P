"use client";

import { useState } from "react";
import { CaretDown, Warning, WarningOctagon, Info, Bug } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Clause } from "@/lib/types";

const SEVERITY_CONFIG = {
  low: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-500",
    Icon: Info,
  },
  medium: {
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    badge: "bg-yellow-500/15 text-yellow-500",
    Icon: Warning,
  },
  high: {
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    badge: "bg-orange-500/15 text-orange-500",
    Icon: WarningOctagon,
  },
  critical: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "bg-red-500/15 text-red-500",
    Icon: Bug,
  },
};

function ClauseCard({ clause }: { clause: Clause }) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[clause.severity];
  const { Icon } = cfg;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        cfg.border,
        open ? cfg.bg : "bg-foreground/[0.02] hover:bg-foreground/[0.04]"
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-4 text-left cursor-pointer"
      >
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
            cfg.badge
          )}
        >
          <Icon size={16} weight="bold" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                cfg.badge
              )}
            >
              {clause.severity}
            </span>
            <span className="rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-xs text-muted-foreground">
              {clause.category}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {clause.explanation}
          </p>
        </div>

        <CaretDown
          size={16}
          weight="bold"
          className={cn(
            "shrink-0 mt-1 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-foreground/[0.06] px-4 pb-4 pt-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Original clause
          </p>
          <blockquote className="border-l-2 border-foreground/20 pl-3 text-sm text-muted-foreground italic leading-relaxed">
            {clause.text}
          </blockquote>
        </div>
      )}
    </div>
  );
}

interface RiskClausesProps {
  clauses: Clause[];
}

export function RiskClauses({ clauses }: RiskClausesProps) {
  if (clauses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No flagged clauses found in this document.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {clauses.map((clause, i) => (
        <ClauseCard key={i} clause={clause} />
      ))}
    </div>
  );
}
