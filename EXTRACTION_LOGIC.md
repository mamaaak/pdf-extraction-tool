# Extraction Logic (concise)

End‑to‑end flow from PDF → text → LLM → validated data → UI.

## Pipeline
1. Upload PDF (`/api/documents/extract`)
2. Extract text with `pdf-parse`
3. Preprocess + detect document type
4. LLM extraction (structured JSON) via Groq
5. Filter hallucinations (ensure entity text exists in source)
6. Validate (counts, presence, reasonable values) → confidence score
7. LLM quick analysis for UI summary (findings, topics, dates, entities)
8. Return `{ data, metadata, text, findings, mainTopics, importantDates, keyEntities }`

## Document types
Watershed plans, environmental assessments, agricultural reports, conservation plans, regulatory documents, climate studies, general.

## Key modules
- `backend/src/services/pdfService.js`: `extractTextFromPDF`, `analyzeWithGroq`
- `backend/src/services/documentExtractor.js`: preprocessing, prompt building, validation, false‑positive filtering
- `backend/src/services/watershedExtractor.js`: tuned extractor for watershed plans

## Validation summary
- Entity presence in source text (zero false positives for copied names)
- Summary counts match arrays
- Section validations accumulate to confidence (≥75% target)

## Frontend mapping
- Summary tab: `findings` (LLM); fallback to text preview
- Charts tab: reuses `Dashboard` charts fed by `data`
- Dates tab: `importantDates` or regex‑extracted from `text`