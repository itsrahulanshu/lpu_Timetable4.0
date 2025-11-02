# LPU Timetable App

Modern timetable application for LPU students with native mobile design.

## Features

- 📱 Native mobile app design
- 🎨 Dark/Light mode
- 📊 Stats cards (total & today's classes)
- 🔄 Smart caching & auto-refresh
- 📴 Offline PWA support
- ⚡ Fast & responsive
- 🎯 Current/next class highlighting

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express

## Deployment

### Vercel

**Backend:**
```bash
cd backend && vercel --prod
```
Environment variables: `UMS_USERNAME`, `UMS_PASSWORD`, `FRONTEND_URL`, `NODE_ENV=production`

**Frontend:**
```bash
cd frontend && vercel --prod
```
Environment variable: `VITE_API_URL`

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install  
cp .env.example .env
npm run dev
```

Open: http://localhost:5173

## License

MIT
