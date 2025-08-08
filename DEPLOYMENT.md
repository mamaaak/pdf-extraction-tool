# Deployment (concise)

## Architecture
- Frontend: Vercel (Next.js)
- Backend: Node host or Docker (Express)

## Frontend (Vercel)
1) Root: `frontend/`
2) Env: `NEXT_PUBLIC_API_URL=https://<your-backend>/api`
3) Build: `npm install` → `npm run build` → output `.next`

## Backend options

### Node host (Heroku/DigitalOcean/etc.)
- Env: `GROQ_API_KEY`, `NODE_ENV=production`, `PORT=5000`
- Start: `node src/index.js`

### Docker
```bash
cd backend
docker build -t pdf-extraction-backend .
docker run -p 5000:5000 \
  -e GROQ_API_KEY=YOUR_KEY \
  -e NODE_ENV=production \
  pdf-extraction-backend
```

## Security
- Keep `GROQ_API_KEY` secret
- CORS/Helmet enabled; serve over HTTPS in production
- Validate file uploads (PDF, size limit)

## Scaling
- Add request rate limits and caching
- Monitor Groq usage/latency; consider serverless for bursty loads