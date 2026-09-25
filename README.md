# 🚌 Bus Pass System

A full-stack cloud-based bus pass management system built with **React** (frontend) and **Express + Node.js** (backend), using **PostgreSQL** in production.

---

## 📁 Project Structure

```
bus-pass-system/
├── frontend/          # React app (Vercel)
│   ├── src/
│   ├── public/
│   └── vercel.json
├── backend/           # Express API (Railway)
│   ├── src/
│   ├── seed/
│   ├── railway.toml
│   └── vercel.json
└── docs/
```

---

## 🚀 Deployment

### 1. Push to GitHub

```bash
cd bus-pass-system
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bus-pass-system.git
git push -u origin main
```

---

### 2. Deploy Backend → Railway

1. Go to railway.app → New Project
2. Click Deploy from GitHub repo → select bus-pass-system
3. Set the Root Directory to backend
4. Railway auto-detects Node.js via railway.toml
5. Add a PostgreSQL plugin: click + New → Database → PostgreSQL
6. Railway automatically injects DATABASE_URL into your backend env
7. Add these environment variables in Railway's dashboard:

| Variable | Value |
|---|---|
| NODE_ENV | production |
| JWT_SECRET | a long random secret |
| JWT_EXPIRES_IN | 7d |
| PORT | 5000 |

8. Copy the public domain Railway gives you, e.g. https://bus-pass-backend.up.railway.app

---

### 3. Deploy Frontend → Vercel

1. Go to vercel.com → Add New Project
2. Import your GitHub repo bus-pass-system
3. Set Root Directory to frontend
4. Framework preset: Create React App
5. Add this environment variable in Vercel's dashboard:

| Variable | Value |
|---|---|
| REACT_APP_API_URL | https://bus-pass-backend.up.railway.app |

6. Click Deploy

---

## Environment Variables

### Backend (set in Railway)
| Variable | Description |
|---|---|
| DATABASE_URL | Auto-injected by Railway PostgreSQL plugin |
| NODE_ENV | production |
| JWT_SECRET | Random string, keep secret |
| JWT_EXPIRES_IN | e.g. 7d |
| PORT | 5000 (Railway may override this) |

### Frontend (set in Vercel)
| Variable | Description |
|---|---|
| REACT_APP_API_URL | Your Railway backend URL |

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Health Check

GET /health returns { "status": "ok", "instance": "...", "uptime": ... }
