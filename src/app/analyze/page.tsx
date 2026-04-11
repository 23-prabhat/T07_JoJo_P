"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sun, Moon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { RiskMeter } from "@/components/RiskMeter";
import { RiskClauses } from "@/components/RiskClauses";
import { PlainSummary } from "@/components/PlainSummary";
import { ComprehensionQuiz } from "@/components/ComprehensionQuiz";
import { SessionActivity, type ActivityEvent } from "@/components/SessionActivity";
import { useTheme } from "@/contexts/theme";
import type { Analysis } from "@/lib/types";

const STORAGE_KEY = "clearconsent_analysis";

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 font-display text-2xl text-foreground">{children}</h2>
  );
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-foreground/[0.07] bg-card p-6 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </motion.section>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [consented, setConsented] = useState(false);

  const [events, setEvents] = useState<ActivityEvent[]>([
    { label: "Document uploaded", timestamp: null, done: false },
    { label: "AI analysis complete", timestamp: null, done: false },
    { label: "Quiz passed", timestamp: null, done: false },
    { label: "Consent confirmed", timestamp: null, done: false },
  ]);

  const markEvent = useCallback((index: number) => {
    setEvents((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, done: true, timestamp: fmt(new Date()) } : e
      )
    );
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const data: Analysis = JSON.parse(raw);
      setAnalysis(data);
      // Mark first two events as done (upload + analysis already happened)
      setEvents((prev) =>
        prev.map((e, i) =>
          i <= 1 ? { ...e, done: true, timestamp: fmt(new Date(data.createdAt)) } : e
        )
      );
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleQuizPass = useCallback(() => {
    setQuizPassed(true);
    markEvent(2);
  }, [markEvent]);

  const handleConsent = useCallback(() => {
    setConsented(true);
    markEvent(3);
  }, [markEvent]);

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-foreground/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warm text-warm-foreground">
              <Shield size={18} weight="bold" />
            </div>
            <span className="font-display text-xl tracking-tight text-foreground">
              ClearConsent
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-foreground/[0.05] px-3 py-1 font-mono text-xs text-muted-foreground">
              #{analysis.auditId.slice(0, 8)}
            </span>
            <button
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-all hover:border-warm/30 hover:text-warm cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={16} weight="bold" />
              ) : (
                <Moon size={16} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl text-foreground sm:text-4xl"
          >
            Analysis complete
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-1 text-sm text-muted-foreground"
          >
            Analyzed {new Date(analysis.createdAt).toLocaleString()} Â· Language:{" "}
            {analysis.language.toUpperCase()}
          </motion.p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Risk score */}
            <Section>
              <SectionHeading>Risk Assessment</SectionHeading>
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                <RiskMeter score={analysis.riskScore} level={analysis.riskLevel} />
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Quick summary
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {analysis.summary.split("\n")[0]}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                      <p className="text-xs text-muted-foreground">Flagged clauses</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {analysis.hiddenClauses.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                      <p className="text-xs text-muted-foreground">Key obligations</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {analysis.keyObligations.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Plain summary */}
            <Section>
              <SectionHeading>Plain-Language Summary</SectionHeading>
              <PlainSummary
                summary={analysis.summary}
                keyObligations={analysis.keyObligations}
              />
            </Section>

            {/* Flagged clauses */}
            <Section>
              <SectionHeading>
                Flagged Clauses ({analysis.hiddenClauses.length})
              </SectionHeading>
              <RiskClauses clauses={analysis.hiddenClauses} />
            </Section>

            {/* Quiz */}
            <Section>
              <SectionHeading>Comprehension Check</SectionHeading>
              <p className="mb-5 text-sm text-muted-foreground">
                Answer at least 2 of 3 questions correctly to unlock consent.
              </p>
              {analysis.quiz.length > 0 ? (
                <ComprehensionQuiz
                  questions={analysis.quiz}
                  onPass={handleQuizPass}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No quiz questions generated.</p>
              )}
            </Section>

            {/* Consent button */}
            <Section>
              <SectionHeading>Give Consent</SectionHeading>
              <p className="mb-5 text-sm text-muted-foreground">
                {quizPassed
                  ? "You've demonstrated understanding of this document. You may now confirm consent."
                  : "Complete the comprehension check above to unlock this button."}
              </p>
              {consented ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-5 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                  âœ“ Consent recorded â€” {events[3].timestamp}
                </div>
              ) : (
                <button
                  onClick={handleConsent}
                  disabled={!quizPassed}
                  className="rounded-xl bg-warm px-8 py-3.5 text-sm font-semibold text-warm-foreground transition-all hover:bg-warm/90 hover:shadow-lg hover:shadow-warm/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  I Understand &amp; Consent
                </button>
              )}
            </Section>
          </div>

          {/* Right column â€” session activity */}
          <div className="space-y-5">
            <Section>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Session Activity
              </p>
              <SessionActivity events={events} />
            </Section>

            <Section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Audit info
              </p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-foreground/70 truncate">
                    {analysis.auditId.slice(0, 16)}â€¦
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Risk</dt>
                  <dd className="font-mono text-foreground/70">
                    {analysis.riskScore}/100
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="font-mono text-foreground/70 uppercase">
                    {analysis.language}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Analyzed</dt>
                  <dd className="font-mono text-foreground/70">
                    {new Date(analysis.createdAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </Section>

            <div className="text-center">
              <a
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                â† Analyze another document
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
