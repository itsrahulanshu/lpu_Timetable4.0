# LPU Timetable Frontend

Modern React PWA built with Vite and Tailwind CSS.

## Features

- ⚡ React 18 + Vite for blazing fast development
- 🎨 Tailwind CSS for utility-first styling
- 🌗 Light/Dark theme with system preference detection
- 📱 Fully responsive mobile-first design
- 🔄 Auto-refresh with loading states
- 💾 PWA with offline support
- ✨ Clean 2-color design system

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Create `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Run Development Server

```bash
npm run dev
```

App will start on http://localhost:5173

## Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── TimetableGrid.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── pages/               # Page components
│   │   └── Home.jsx
│   ├── hooks/               # Custom React hooks
│   │   └── useTimetable.js
│   ├── services/            # API client
│   │   └── api.js
│   ├── styles/              # Global styles
│   │   └── global.css
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── index.html
└── package.json
```

## Design System

### Colors

**Light Mode:**
- Primary: `#2563EB` (Blue)
- Background: `#F9FAFB` (Light Gray)
- Text: `#111827` (Dark Gray)

**Dark Mode:**
- Primary: `#3B82F6` (Bright Blue)
- Background: `#111827` (Dark Gray)
- Text: `#F9FAFB` (Light Gray)

### Components

- **TimetableGrid**: Displays classes grouped by day
- **ClassCard**: Individual class item with time, room, type
- **ThemeToggle**: Light/dark mode switcher
- **LoadingSpinner**: Loading state indicator
- **ErrorMessage**: Error display with retry option

## PWA Features

- 📲 Installable on mobile and desktop
- 🔌 Works offline with cached data
- 🔄 Auto-updates when online
- 📱 Native-like experience

## Deployment

### Vercel

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## License

MIT
