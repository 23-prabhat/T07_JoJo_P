# ClearConsent — Project Memory

## Project
MIT Hack for Impact 2026. Financial document protection web app (ClearConsent).
3 products: Web App (Next.js), Browser Extension, Telegram/WhatsApp bots.
Architecture truth: architecture.md

## Stack
- Next.js 16.2.3, React 19, TypeScript, App Router
- Tailwind CSS 4, shadcn/ui, Radix UI, Phosphor Icons, Framer Motion
- AI: Google Gemini 2.5 Pro via `@google/generative-ai`
- PDF: `pdf-parse` 2.x (use `(mod as any).default ?? mod` for import)
- IDs: `uuid`
- Package manager: pnpm

## Key Files
- `src/lib/types.ts` — shared types (Analysis, Clause, QuizQuestion, AnalyzeRequest)
- `src/lib/gemini.ts` — Gemini singleton
- `src/lib/prompts.ts` — all prompts (buildAnalysisPrompt, buildBotSummaryPrompt)
- `src/lib/analyze.ts` — orchestration, MAX_TEXT_CHARS=60k
- `src/lib/pdf.ts` — extractTextFromPDF / extractTextFromTXT
- `src/app/api/upload/route.ts` — POST multipart file → {text}
- `src/app/api/analyze/route.ts` — POST {text,language,readingLevel,source} → Analysis
- `src/app/analyze/page.tsx` — results page (reads sessionStorage key: clearconsent_analysis)
- `src/components/UploadZone.tsx` — wired to /api/upload→/api/analyze, stores in sessionStorage, navigates to /analyze
- UI components: RiskMeter, RiskClauses, PlainSummary, ComprehensionQuiz, SessionActivity

## Important Patterns
- `next.config.ts`: `serverExternalPackages: ["pdf-parse"]` required
- Analysis stored in `sessionStorage` key `clearconsent_analysis` between pages
- Language from `useLanguage()` context (en/hi/mr), reading level UI in UploadZone
- All API routes use `export const runtime = 'nodejs'`
- Agent rules: all AI calls via @/lib/gemini.ts, all prompts in @/lib/prompts.ts

## What's Done (MVP)
- [x] Backend: upload + extract, analyze endpoint
- [x] Web app: full flow upload → analyze → results page
- [x] Risk meter, flagged clauses, summary, quiz, session activity
- [ ] Telegram bot
- [ ] WhatsApp bot
- [ ] Browser extension
