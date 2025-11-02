# 📚 LPU Timetable 4.0 - Modern PWA

> Beautiful, fast, and smart timetable app for LPU students

## 🚀 One-Click Vercel Deployment

**Only 3 Environment Variables Needed:**
```
UMS_USERNAME = your_registration_number
UMS_PASSWORD = your_password  
ANTICAPTCHA_API_KEY = your_anticaptcha_key
```

**That's it!** Everything else is auto-configured! 🎉

[📖 Full Deployment Guide](./DEPLOYMENT.md)

---

## ✨ Features

- 🎨 **Native Mobile Design** - Looks like a real app
- 📊 **Smart Stats** - See total classes and today's count
- 🔄 **Auto-Refresh** - Fetches once daily, saves costs
- ⏱️ **Cooldown System** - 2-minute refresh protection
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **PWA Ready** - Install on any device
- 💾 **Offline Support** - Works without internet
- ⚡ **Lightning Fast** - Optimized performance

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite 5.4, Tailwind CSS 3.4, Framer Motion, Lucide Icons  
**Backend:** Node.js, Express, Anti-Captcha API, Axios

---

## 🚀 Deployment

### Option 1: Vercel (Recommended - Single Deployment)
1. Push to GitHub
2. Import on Vercel
3. Add 3 environment variables
4. Deploy!

Frontend + Backend = **One Domain** ✅

### Option 2: Separate Deployments
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 💻 Local Development

```bash
# Install all dependencies
npm run install:all

# Run frontend (terminal 1)
npm run dev:frontend

# Run backend (terminal 2)
npm run dev:backend
```

Create environment files:
- `backend/.env` - Copy from `.env.example`
- `frontend/.env` - Optional

Open: http://localhost:5173

---

## 💚 Made with Love

Created by **Rahulanshu** with ❤️

---

## 📄 License

MIT License - Feel free to use and modify!
