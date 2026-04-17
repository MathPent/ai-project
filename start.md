# AgroTech AI Platform

Welcome to the AgroTech AI Platform. This is a full-stack, AI-powered agricultural intelligence application equipped with Google Earth Engine tracking and machine-vision crop analysis natively.

## 🚀 Local Quick-Start Guide

To start the whole application, you need to run the three individual sub-systems in three separate terminal windows/panes concurrently.

### 1. Database & Backend API `(Port: 4000)`
The Express.js robustly manages user architecture and Google Cloud integrations.
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
*Creates a local SQLite file (`dev.db`). It intercepts requests cleanly at `http://localhost:4000`.*

### 2. Python AI Service `(Port: 8000)`
The AI microservices engine executes isolated pathogolical crop diagnostics dynamically.
```bash
cd ai-service
# (Recommended) source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Listens internally on `http://localhost:8000/predict`. Tests available on `/docs`.*

### 3. Next.js Frontend `(Port: 3000)`
The presentation interface securely rendering dynamic graphs and React-Leaflet maps.
```bash
cd frontend
npm install
npm run dev
```
*Application heavily bounds to `http://localhost:3000` locally.*

---

## 🌍 Production Deployment Runbook

When you are ready to take AgroTech live to the public internet, deploy the modular architecture cleanly to modern cloud providers:

### Step 1: Deploy AI Microservice (Render / Heroku)
1. Push your `ai-service/` sub-folder to a separate GitHub repo (or configure sub-dir deployments).
2. Connect it to [Render.com](https://render.com) as a "Web Service".
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Copy the generated public URL (e.g., `https://agrotech-ai.onrender.com`).

### Step 2: Deploy Backend Data API (Render / Railway)
Because the backend manages local file uploads (the AI images via `multer`), you will need a volume or you can switch uploads to an AWS S3 bucket logic. Alternatively, just provision a standard Web Service on Render with a persistent disk.
1. Connect the `backend/` directory to a Render Web Service.
2. Build Command: `npm install && npx tsc && npx prisma generate`
3. Start Command: `node dist/index.js`
4. **Environment Variables**: You MUST input `JWT_SECRET`, `EE_CLIENT_EMAIL`, `EE_PRIVATE_KEY` natively inside the cloud settings!
5. **Database**: Swap the local SQLite `DATABASE_URL` string natively for a robust PostgreSQL instance url!
6. Update `AI_SERVICE_URL` to point heavily to the Render URL from Step 1. Copy the new Backend URL (e.g., `https://agrotech-api.onrender.com`).

### Step 3: Deploy Frontend (Vercel)
Vercel is natively tailored exclusively for NextJS platforms.
1. Sign into [Vercel](https://vercel.com) and selectively import your overall github repository.
2. In the "Root Directory" settings, select `frontend`.
3. Framework preset: `Next.js`.
4. Deploy!
5. **CRITICAL:** Once deployed natively, globally override the `axios.post` routes inside `frontend/src/app` codebase so they point directly to your URL generated from Step 2 instead of `http://localhost:4000`!
