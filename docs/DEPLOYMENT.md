# Deploying BizQuery AI to Vercel

This repository is configured to deploy both the **Frontend** (Vite + React) and the **Backend** (FastAPI Serverless Functions) on Vercel.

---

## Architecture Overview

- **Frontend (`/frontend`)**: React 19 + Vite SPA with Tailwind CSS. Configured with [`frontend/vercel.json`](file:///frontend/vercel.json) to handle client-side routing.
- **Backend (`/backend`)**: FastAPI Python application deployed as a Vercel Serverless Function via [`backend/api/index.py`](file:///backend/api/index.py) and [`backend/vercel.json`](file:///backend/vercel.json).

---

## Method 1: Deploy via Vercel Web Dashboard (Recommended)

Because this is a fullstack monorepo, standard practice on Vercel is to create **two linked projects** from the same GitHub repository:

### Step 1: Deploy the Backend
1. Go to [vercel.com/new](https://vercel.com/new) and select your GitHub repository: `Sahil82081/BizQueryAI`.
2. Set **Project Name**: `bizquery-backend`.
3. Set **Root Directory**: click **Edit** and choose `backend`.
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
   - `DATABASE_URL`: *(Optional)* Your PostgreSQL database connection string.
   - `CORS_ORIGINS`: `*` *(or your frontend Vercel URL once deployed)*.
5. Click **Deploy**.
6. Once deployed, copy your production backend URL (e.g. `https://bizquery-backend.vercel.app`).
   - You can test it by visiting `https://bizquery-backend.vercel.app/docs` or `https://bizquery-backend.vercel.app/health`.

### Step 2: Deploy the Frontend
1. Return to [vercel.com/new](https://vercel.com/new) and select the same GitHub repository (`Sahil82081/BizQueryAI`).
2. Set **Project Name**: `bizquery-frontend`.
3. Set **Root Directory**: click **Edit** and choose `frontend`.
4. Vercel will automatically detect **Vite** framework preset.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your backend URL from Step 1 (e.g. `https://bizquery-backend.vercel.app`).
6. Click **Deploy**.
7. Your fullstack BizQuery AI application is now fully live!

---

## Method 2: Deploy via Vercel CLI

Since you already have the Vercel CLI installed and authenticated on your system:

### 1. Deploy Backend:
```bash
cd backend
vercel --prod
```
When prompted:
- Set up and deploy? **Yes** (`Y`)
- Which scope? Select your personal scope.
- Link to existing project? **No** (`N`)
- Project name? `bizquery-backend`
- In which directory is your code located? `./`
- Want to modify settings? **No** (`N`)

After deployment, add your environment variables:
```bash
vercel env add GEMINI_API_KEY production
vercel env add CORS_ORIGINS production
vercel --prod
```

### 2. Deploy Frontend:
```bash
cd ../frontend
vercel --prod
```
When prompted:
- Set up and deploy? **Yes** (`Y`)
- Which scope? Select your personal scope.
- Link to existing project? **No** (`N`)
- Project name? `bizquery-frontend`
- In which directory is your code located? `./`

Add your backend API URL to the frontend:
```bash
vercel env add VITE_API_URL production
# Enter your backend URL when prompted (e.g. https://bizquery-backend.vercel.app)
vercel --prod
```

---

## Verification Checklist

- [ ] Backend health check returns 200: `https://<backend-url>/health`
- [ ] Backend Swagger documentation opens: `https://<backend-url>/docs`
- [ ] Frontend loads and connects to backend without CORS errors
- [ ] Database connections can be added and tested from the UI
