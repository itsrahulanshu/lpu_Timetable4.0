# LPU Timetable Backend

Modern Express.js backend with extracted business logic from the old timetable app.

## Features

- ✅ Clean architecture with separated services
- ✅ UMS authentication with captcha solving
- ✅ Timetable data fetching and parsing
- ✅ In-memory caching with rate limiting
- ✅ CORS enabled for frontend
- ✅ Ready for Vercel deployment

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
UMS_USERNAME=your_registration_number
UMS_PASSWORD=your_password
ANTICAPTCHA_API_KEY=your_api_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T...",
  "env": "development"
}
```

### `GET /api/timetable`
Get cached timetable data

**Response:**
```json
{
  "success": true,
  "data": [...],
  "cached": true,
  "timestamp": "2025-11-02T...",
  "classCount": 10
}
```

### `POST /api/timetable/refresh`
Fetch fresh timetable data (rate limited: 10 min)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "cached": false,
  "timestamp": "2025-11-02T...",
  "classCount": 10
}
```

### `GET /api/timetable/status`
Get cache status

**Response:**
```json
{
  "success": true,
  "cached": true,
  "classCount": 10,
  "timestamp": "2025-11-02T...",
  "minutesAgo": 5,
  "nextRefreshAllowed": true
}
```

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── services/
│   │   ├── auth.service.js     # Authentication logic
│   │   └── timetable.service.js # Timetable fetching & parsing
│   ├── routes/
│   │   └── timetable.routes.js # API routes
│   └── index.js                # Express server
└── package.json
```

## Deployment

### Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `UMS_USERNAME`
- `UMS_PASSWORD`
- `ANTICAPTCHA_API_KEY`

## License

MIT
