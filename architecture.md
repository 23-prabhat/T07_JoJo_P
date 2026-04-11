# Hack for Impact — Architecture & Implementation Guide

> **This file is the single source of truth for all agents and teammates working on this project. Read it fully before writing any code.**

---

## Problem Statement

Many users with low literacy, language barriers, or limited digital familiarity are required to approve financial actions — loans, mandates, recurring payments, insurance terms, consent-based onboarding flows — without fully understanding what they're agreeing to. Consent is captured digitally but not meaningfully understood, creating real risks of misinformed approvals, coercion, hidden obligations, and financial harm.

**Our mission:** Make financial authorization more accessible, understandable, and trustworthy by transforming how intent, obligations, and risk are communicated *before* someone clicks "I Agree".

---

## Solution Overview — 3 Products

We ship three interconnected tools that share a single AI analysis backend:

| Product | Channel | Use Case |
|---|---|---|
| **Web App** | Browser (Next.js) | Upload a PDF/doc, get full risk assessment before signing |
| **Browser Extension** | Chrome Extension | Understand T&C on any website in real time |
| **Bot** | Telegram + WhatsApp (Twilio) | Send a selectable-text PDF via chat, get analysis back |

The web app uploads files to `/api/upload` (extracts text), then sends text to `/api/analyze`. The extension extracts page text client-side and calls `/api/analyze` directly. Bots are document-only in the demo: they accept PDF uploads, extract text server-side, then call `/api/analyze`. Same AI backend, different ingestion paths per surface.

---

## Tech Stack

### Core
- **Framework**: Next.js 16.2.3 (App Router, React 19, TypeScript)
- **AI**: Google Gemini 2.5 Pro via `@google/generative-ai`
- **PDF Text Extraction**: `pdf-parse` (server-side, extracts text from selectable/copyable PDFs)
- **OCR**: Not part of MVP. Demo scope assumes selectable-text PDFs only
- **IDs**: `uuid` — audit trail IDs
- **Styling**: Tailwind CSS 4, shadcn/ui (`radix-lyra` style via `components.json`), Radix UI, Phosphor Icons
- **Package Manager**: pnpm. If `/extension/` is added, update `pnpm-workspace.yaml` to include it explicitly

> **Note:** `pdf-parse`, `uuid`, `@google/generative-ai`, `grammy`, and `twilio` all need to be installed — none are in `package.json` yet.

### Browser Extension
- Vite + React (builds into `extension/dist/`)
- Chrome Manifest V3
- Calls deployed Next.js API (set via `VITE_API_URL`)

### Bots
- **Telegram**: `grammy` library (webhook-based)
- **WhatsApp**: Twilio SDK (Twilio Sandbox — no Meta Business verification needed)

### Deployment
- **Next.js app**: Vercel
- **Extension**: Load unpacked locally for demo (or Chrome Web Store if time allows)
- **Bots**: Webhooks pointed to Vercel deployment URL

---

## Project Structure

```
hack-for-impact/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page + file upload UI
│   │   ├── analyze/
│   │   │   └── page.tsx                # Results page (risk meter, clauses, quiz)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css
│   │   └── api/
│   │       ├── upload/
│   │       │   └── route.ts            # POST: file upload + text extraction (PDF/text/image → text)
│   │       ├── analyze/
│   │       │   └── route.ts            # POST: core analysis endpoint (used by all 3 products)
│   │       ├── telegram/
│   │       │   └── route.ts            # POST: Telegram webhook handler
│   │       └── whatsapp/
│   │           └── route.ts            # POST: Twilio/WhatsApp webhook handler
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (button, card, etc.)
│   │   ├── UploadZone.tsx              # Drag-and-drop PDF/text upload
│   │   ├── RiskMeter.tsx               # Visual risk gauge (0–100, color-coded)
│   │   ├── RiskClauses.tsx             # List of flagged clauses with explanations
│   │   ├── PlainSummary.tsx            # Plain-language rewrite display
│   │   ├── ComprehensionQuiz.tsx       # 3-question quiz user must pass before consent
│   │   ├── SessionActivity.tsx         # Timestamped log of user actions in the current browser session
│   │   ├── LanguagePicker.tsx          # Language selector (drives API param)
│   │   └── ReadingLevelSlider.tsx      # ELI5 → Expert slider
│   └── lib/
│       ├── gemini.ts                   # Gemini API client (singleton, all AI calls go here)
│       ├── pdf.ts                      # PDF/text extraction helpers
│       ├── analyze.ts                  # Core analysis orchestration logic
│       ├── prompts.ts                  # ALL AI prompts (single source of truth for prompts)
│       ├── risk.ts                     # Risk scoring helpers
│       └── types.ts                    # Shared TypeScript types/interfaces
├── extension/
│   ├── manifest.json                   # Chrome Manifest V3
│   ├── package.json                    # Extension-specific deps (vite, react)
│   ├── vite.config.ts
│   ├── .env.example                    # VITE_API_URL=https://your-vercel-url.vercel.app
│   └── src/
│       ├── content.ts                  # Content script: reads page text, injects sidebar
│       ├── popup.tsx                   # Extension popup UI (risk badge, open sidebar)
│       ├── sidebar.tsx                 # Full analysis panel injected into page
│       └── background.ts              # Service worker: handles messaging
├── architecture.md                     # THIS FILE
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── .env.example                        # GEMINI_API_KEY, TELEGRAM_BOT_TOKEN, TWILIO_*
```

---

## Shared Data Types (`src/lib/types.ts`)

```typescript
export interface Clause {
  text: string           // the original clause text
  explanation: string    // plain-language explanation
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string       // e.g. "Auto-renewal", "Data sharing", "Arbitration clause"
}

export interface QuizQuestion {
  question: string
  options: string[]      // 4 options
  correctIndex: number
}

export interface Analysis {
  summary: string              // plain-language summary (2–3 paragraphs)
  riskScore: number            // 0–100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  keyObligations: string[]     // bullet list: what user is agreeing to
  hiddenClauses: Clause[]      // flagged dangerous/unusual clauses
  quiz: QuizQuestion[]         // 3 comprehension questions
  language: string             // language used for output
  auditId: string              // UUID for this analysis session
  createdAt: string            // ISO timestamp
}

export interface AnalyzeRequest {
  text: string                 // extracted text content
  language?: string            // target output language, default 'en'
  readingLevel?: 'eli5' | 'simple' | 'standard' | 'expert'  // default 'simple'
  source?: 'web' | 'extension' | 'bot'
}
```

---

## API Contract

### `POST /api/upload`

File upload and text extraction endpoint. Used by the web app before calling `/api/analyze`.

**Request:** `multipart/form-data` with a single `file` field (`.pdf`, `.txt`, `.jpg`, or `.png`).

**Response (200):**
```json
{ "text": "...extracted text from the file..." }
```

Extraction logic:
- PDF → `pdf-parse`
- TXT → decode as UTF-8 text
- JPG/PNG → optional web-only support if time allows; not part of the bot demo path
- Error if no usable text is extracted or the file type is unsupported

---

### `POST /api/analyze`

Pure text analysis endpoint used by all three products.

**Request body:** `application/json`
```json
{
  "text": "...extracted document text...",
  "language": "en",
  "readingLevel": "simple",
  "source": "web"
}
```

**Web app flow:** upload file via `/api/upload` → get text → call `/api/analyze` with text.
**Extension:** extracts page text client-side, then calls `/api/analyze`.
**Bots:** upload a PDF, server extracts text, then calls `/api/analyze`.

**Response (200):**
```json
{
  "summary": "...",
  "riskScore": 72,
  "riskLevel": "high",
  "keyObligations": ["You allow auto-renewal every year", "..."],
  "hiddenClauses": [
    {
      "text": "original clause...",
      "explanation": "This means...",
      "severity": "high",
      "category": "Auto-renewal"
    }
  ],
  "quiz": [
    {
      "question": "How many days do you have to cancel?",
      "options": ["7 days", "14 days", "30 days", "No cancellation"],
      "correctIndex": 2
    }
  ],
  "language": "en",
  "auditId": "uuid-here",
  "createdAt": "2026-04-11T10:00:00Z"
}
```

**Error (400/500):**
```json
{ "error": "No extractable text found in PDF." }
```

---

### `POST /api/telegram`

Telegram webhook. Registered via: `https://api.telegram.org/bot{TOKEN}/setWebhook?url={VERCEL_URL}/api/telegram`

Handles:
- PDF document uploads only
- Download uploaded PDF, extract text, run analysis, reply with formatted summary
- Ignore or reject plain text messages during the demo

### `POST /api/whatsapp`

Twilio webhook (Twilio Sandbox). Registered in Twilio console.

Handles:
- PDF media messages only
- Download PDF from Twilio `MediaUrl`, extract text, run analysis
- Ignore or reject plain text messages during the demo
- Reply format: short summary + risk level emoji + "Reply DETAILS for full report"

---

## Product 1: Web App (`src/app/`)

### User Flow
1. User lands on homepage — sees value prop + upload zone
2. Uploads a PDF or `.txt` file, or pastes text directly
3. Selects language + reading level
4. Clicks "Analyze" → loading state while API processes
5. Results page shows:
   - **Risk Meter**: animated gauge (green → red), score out of 100
   - **Plain Summary**: rewritten document in chosen language/level
   - **Flagged Clauses**: cards with original text, explanation, severity badge
   - **Key Obligations**: what you're actually agreeing to
   - **Comprehension Quiz**: 3 questions — must pass before "I Understand" button unlocks
   - **Session Activity**: timeline of: Uploaded → Analyzed → Quiz Passed → Confirmed
6. User clicks "I Understand" — session activity log is complete

### Key UI Components
- `UploadZone`: drag-and-drop, supports PDF + `.txt` + paste. Files are uploaded via `FormData` to `/api/upload` (returns extracted text), then text is sent to `/api/analyze`.
- `RiskMeter`: animated SVG arc or canvas gauge. Color: green (0–30), yellow (31–60), orange (61–80), red (81–100).
- `RiskClauses`: expandable cards per clause. Severity badge colors match risk meter.
- `ComprehensionQuiz`: multi-choice quiz. Tracks score. "I Understand" button disabled until 2/3 correct.
- `SessionActivity`: vertical timeline component. Events logged client-side with timestamps for the current browser session only.

---

## Product 2: Browser Extension (`extension/`)

### Architecture
- **Content script** (`content.ts`): injected on supported pages. On activation, extracts likely legal or transaction text instead of blindly sending the entire `<body>`.
- **Background service worker** (`background.ts`): receives extracted text, enforces input limits, POSTs to `VITE_API_URL/api/analyze`, returns result to sidebar.
- **Popup** (`popup.tsx`): small 320px popup. Shows current page risk score (if analyzed). Button to open full sidebar.
- **Sidebar** (`sidebar.tsx`): injected `<iframe>` or shadow DOM panel on the right side of the page. Shows full analysis: summary, flagged clauses, risk meter.

### Extension Build
```
extension/
├── package.json       # "build": "vite build"
└── vite.config.ts     # multi-entry: popup, content, background, sidebar
```

Build outputs to `extension/dist/` — load this folder as unpacked extension in Chrome.

### Environment
```
# extension/.env
VITE_API_URL=https://hack-for-impact.vercel.app
```

---

## Product 3: Bots

### Telegram (`src/app/api/telegram/route.ts`)
- Library: `grammy`
- Register webhook on deploy (one-time curl command)
- Commands:
  - `/start` — intro message
  - `/analyze` — prompt user to send a PDF
  - PDF document messages → auto-analyze
  - Plain text messages → reply with "Please upload a PDF document for analysis."
- Response format:
  ```
  📄 Analysis Complete

  🔴 Risk Level: HIGH (72/100)

  📋 Summary:
  [plain language summary]

  ⚠️ Watch out for:
  • Auto-renewal clause — charges you yearly
  • Data sharing with third parties

  ✅ You must answer 3 questions to confirm understanding. Reply /quiz to start.
  ```

### WhatsApp via Twilio Sandbox (`src/app/api/whatsapp/route.ts`)
- Twilio Sandbox: users join by sending a keyword to Twilio's number
- No Meta verification needed — perfect for hackathon demos
- Library: `twilio` SDK
- Same analysis logic as Telegram, but document-only
- SMS-friendly response (shorter, no markdown)

---

## Shared AI Logic (`src/lib/`)

### `gemini.ts`
```typescript
// Singleton Gemini client. All AI calls go through here.
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
```

### `prompts.ts`
All prompts live here. Never write prompts inline in route handlers or components.

Key prompts:
- `buildAnalysisPrompt(text, language, readingLevel)` → returns the full structured prompt that asks Gemini for JSON output matching the Analysis schema
- `buildQuizPrompt(text)` → generates 3 comprehension questions
- `buildBotSummaryPrompt(text, language)` → short format for bot replies

### `pdf.ts`
```typescript
import pdfParse from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  if (data.text && data.text.trim().length >= 50) {
    return data.text
  }
  throw new Error('No extractable text found. Please upload a selectable-text PDF.')
}

export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return buffer.toString('utf8')
}
```

**Extraction strategy:** MVP assumes selectable-text PDFs. We use `pdf-parse` for PDFs and UTF-8 decoding for `.txt` files. If a PDF has no usable text, return a clear error telling the user to upload a selectable-text PDF. Image OCR is optional and outside the core demo path.

### `analyze.ts`
Orchestrates the full analysis:
1. Calls Gemini with the analysis prompt
2. Parses JSON response
3. Validates against the Analysis schema
4. Generates auditId (UUID)
5. Returns complete Analysis object
6. Enforces input length limits before sending text to the model

---

## Environment Variables

```bash
# .env.local (Next.js)
GEMINI_API_KEY=your_gemini_api_key

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Twilio sandbox number
```

Optional:
```bash
# Extension
VITE_API_URL=https://hack-for-impact.vercel.app
```

---

## Deployment

### Vercel (Next.js app)
1. Push to GitHub, connect to Vercel
2. Set all env vars in Vercel dashboard
3. Deploy — note your production URL (e.g. `https://hack-for-impact.vercel.app`)

### Register Telegram Webhook (one-time after deploy)
```bash
curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://hack-for-impact.vercel.app/api/telegram"
```

### Twilio WhatsApp Sandbox
1. Go to Twilio Console → Messaging → Try WhatsApp
2. Set webhook URL to: `https://hack-for-impact.vercel.app/api/whatsapp`
3. Users join sandbox by texting the keyword to the Twilio number

### Browser Extension (local demo)
1. `cd extension && pnpm build`
2. Chrome → `chrome://extensions` → Enable Developer Mode → Load Unpacked → select `extension/dist/`

---

## Agent Conventions

Rules all agents must follow when writing code for this project:

1. **All AI calls go through `@/lib/gemini.ts`** — never import `@google/generative-ai` directly in components or route handlers
2. **All prompts live in `@/lib/prompts.ts`** — no inline prompt strings anywhere else
3. **Document extraction only via `@/lib/pdf.ts`** — MVP supports selectable-text PDFs and `.txt`; do not assume OCR exists
4. **API routes are thin** — validation + call lib function + return response. No business logic in route files.
5. **Shared types from `@/lib/types.ts`** — never redefine Analysis, Clause, etc.
6. **Extension calls the API** — extension has no AI logic itself; it extracts likely relevant page text and calls `/api/analyze`
7. **Bot handlers are thin** — extract text from message, call `analyze()`, format response, reply
8. **Bots are document-only for the demo** — do not implement plain-text analysis in Telegram or WhatsApp
9. **Input limits are mandatory** — truncate or reject oversized payloads before calling the model
10. **Language support**: pass `language` param to all Gemini calls. Gemini 2.5 Pro handles translation natively — no separate translation library needed
11. **Reading level**: `eli5` = explain like I'm 5, `simple` = 6th grade, `standard` = adult, `expert` = professional
12. **Client-side session logs are not legal audit records** — do not describe them as tamper-proof or durable
13. **Never commit API keys** — use `.env.local` (gitignored) and Vercel env vars

---

## Features Checklist (Priority Order)

### Must Have (MVP)
- [ ] Web: PDF upload + text extraction
- [ ] Web: `.txt` upload + pasted text support
- [ ] Web: Gemini analysis → risk score + summary + flagged clauses
- [ ] Web: Risk meter UI component
- [ ] Web: Plain language summary display
- [ ] Web: Comprehension quiz (3 questions, must pass to consent)
- [ ] Telegram bot: selectable-text PDF analysis
- [ ] WhatsApp bot: selectable-text PDF analysis (Twilio sandbox)

### Should Have
- [ ] Extension: content script extracts likely legal page text
- [ ] Extension: popup with risk score
- [ ] Extension: sidebar with full analysis
- [ ] Web: language picker (at minimum English + Hindi + Spanish)
- [ ] Web: reading level slider
- [ ] Web: session activity timeline

### Nice to Have
- [ ] Web: image upload support
- [ ] Web: downloadable session summary (PDF)
- [ ] Extension: highlight dangerous text on the page itself
- [ ] Web: animated transitions on results page
