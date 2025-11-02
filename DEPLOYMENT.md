# LPU Timetable 4.0 - Deployment Guide

## 🚀 One-Click Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account
- UMS credentials
- Anti-Captcha API key

### Deployment Steps

1. **Fork/Push this repo to GitHub**

2. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Import your GitHub repository

3. **Configure Project**
   - Leave **Root Directory** as default (root)
   - Framework Preset: **Other**
   - Build Settings: Leave as detected

4. **Add Environment Variables** (Only these 3!)
   ```
   UMS_USERNAME = your_registration_number
   UMS_PASSWORD = your_password
   ANTICAPTCHA_API_KEY = your_anticaptcha_key
   ```

5. **Click Deploy** 🎉

That's it! Your app will be live in 2-3 minutes!

---

## ✨ Features
- ✅ Frontend + Backend in single deployment
- ✅ Auto-configured API routes
- ✅ No manual environment setup needed
- ✅ One domain for everything
- ✅ Automatic CORS handling

---

## 📱 App Features
- Native mobile design
- Smart caching (daily auto-fetch)
- 2-minute refresh cooldown
- Dark mode support
- PWA ready
- Offline support
- Made with ❤️ by Rahulanshu

---

## 🔧 Local Development

```bash
# Install dependencies
npm run install:all

# Run frontend
npm run dev:frontend

# Run backend (separate terminal)
npm run dev:backend
```

Create `.env` files:
- `backend/.env` - Add UMS credentials
- `frontend/.env` - Optional

---

## 🌐 Production URLs
After deployment:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api`

Everything works on the same domain! 🎯
