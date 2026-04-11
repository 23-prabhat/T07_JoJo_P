"use client";

import { ArrowRight } from "@phosphor-icons/react";

export function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 rounded-xl bg-warm px-6 py-3 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90 hover:gap-3 cursor-pointer"
    >
      Get started
      <ArrowRight size={16} weight="bold" />
    </button>
  );
}
