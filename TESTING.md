# Testing

Concise guide to validate functionality and accuracy.

## Frontend
- Unit: `cd frontend && npm run test`
- Integration: `cd frontend && npm run test:integration`
- E2E (Cypress): `cd frontend && npm run test:e2e`

Focus areas: uploader, results tabs, dashboard charts, error states.

## Backend
- Unit: `cd backend && npm run test`
- API: `cd backend && npm run test:api`

Focus areas: PDF parsing, preprocessing, prompt building, validation.

## Accuracy (Watershed plans)
```bash
cd backend
npm run accuracy:download
node test/accuracy/generateGroundTruth.js test/data/<file.pdf>
npm run accuracy:run
npm run accuracy:report
```
What it checks:
- ≥75% accuracy for goals, BMPs, monitoring
- Zero false positives (flagged in summary)
- Per‑file and overall metrics; updates `backend/test/results/*.md` and `TESTING.md`

Ground truth location: `backend/test/data/ground-truth/<planId>.json`.

## Mock LLM
Use Jest to mock Groq responses when needed.

## Coverage targets
- Frontend 80%+, Backend 85%, critical paths 90%+.