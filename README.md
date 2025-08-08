# PDF Analyzer (Next.js + Express + Groq)

Full‑stack tool to upload PDFs, extract structured data with Groq LLM, summarize content, and visualize results.

## Structure

```
frontend/   Next.js app (Tailwind + shadcn/ui)
backend/    Express API (pdf-parse + Groq SDK)
```

## Quick start

1) Env vars
- `frontend/.env.local`
  - Local: `NEXT_PUBLIC_API_URL=http://localhost:3001`
  - Deployed (Render): `NEXT_PUBLIC_API_URL=https://pdf-extraction-tool.onrender.com`
- `backend/.env`
  - `GROQ_API_KEY=YOUR_KEY`
  - `NODE_ENV=development`
  - `PORT=3001`

2) Install & run
```bash
# root
npm install

# frontend
cd frontend && npm install && npm run dev

# backend
cd ../backend && npm install && npm run dev
```
Open `http://localhost:3000`.

## Key features
- Upload PDF (100MB), extract text, and run LLM for:
  - Structured data (goals, BMPs, implementation, monitoring…)
  - Narrative summary + topics + entities + dates (for Summary tab)
- Results UI
  - Summary tab: LLM summary (falls back to text preview)
  - Charts tab: embeds the Dashboard charts for the current result
  - Dates tab: shows provided dates or auto-extracted dates
- Export JSON/CSV via `GET /api/export/:id?format=csv`.

## API (high‑level)
- `POST /api/documents/extract` – upload PDF, returns `{ data, metadata, text, findings, mainTopics, importantDates, keyEntities }`.
- `POST /api/documents/process-text` – send raw text, same response shape.
- `GET /api/documents/types` – supported types.

## Accuracy testing (backend)
```bash
cd backend
npm run accuracy:download      # sample PDFs
node test/accuracy/generateGroundTruth.js test/data/<file.pdf>
npm run accuracy:run           # runs tests (≥75% target)
npm run accuracy:report        # writes markdown + updates TESTING.md
```

## Notes
- Tailwind + shadcn configured in `frontend/tailwind.config.js` and `postcss.config.js`.
- Set `GROQ_API_KEY` before running backend and tests.