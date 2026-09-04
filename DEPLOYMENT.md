# 🚀 Stick Scape Studio — Hosting & Deployment Guide

This repository is pre-configured for seamless production hosting.

---

## 🛠️ Architecture Summary

- **Frontend**: React 19 + Vite + TailwindCSS 4 (builds to `/dist`)
- **Backend**: Express + TypeScript + Prisma ORM (builds to `/server/dist`)
- **Database**: PostgreSQL (Supabase, Neon, Render, Railway, AWS, or local)
- **Unified Hosting Mode**: In production, the Express backend automatically serves the React frontend SPA (`/dist`) and API endpoints (`/api/*`) on the same port/domain.

---

## 🌟 Option 1: 1-Click Fullstack on Render (Recommended & Free)

Render can build the frontend, run the backend, and host a managed PostgreSQL database together.

### Steps:
1. Push this repository to **GitHub** or **GitLab**.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** &rarr; **Blueprint**.
3. Select your repository. Render will automatically detect the [`render.yaml`](./render.yaml) file.
4. Click **Apply Blueprint**.
5. Render will automatically:
   - Create a free PostgreSQL database.
   - Run `npm install`, generate Prisma client, push database schema, and build the React frontend bundle.
   - Launch your live website with SSL/HTTPS!

---

## ⚡ Option 2: Split Hosting (Vercel Frontend + Render/Railway Backend)

### Step 1: Deploy Backend (Render / Railway / Fly.io)
1. In Render/Railway, create a **Web Service** pointing to the `server/` directory (or root).
2. Set Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Supabase, Neon, or Railway).
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Any random 32-character string.
   - `FRONTEND_URL`: Your Vercel frontend domain (e.g. `https://stick-scape-studio.vercel.app`).
3. Build Command: `npm --prefix server install && npm run db:generate && npm run db:push && npm --prefix server run build`
4. Start Command: `npm --prefix server run start`

### Step 2: Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) &rarr; **Add New Project**.
2. Select your repository.
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
   - `VITE_ADMIN_MOBILE`: `8754132491`
5. Click **Deploy**.

---

## 🐳 Option 3: Docker / VPS / Railway / Coolify

A production-ready multi-stage `Dockerfile` is included.

```bash
# Build Docker Image
docker build -t stick-scape-studio .

# Run Container
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@dbhost:5432/stickscapestudio" \
  -e JWT_SECRET="your_secure_secret" \
  stick-scape-studio
```

---

## 🔑 Production Environment Variables Reference

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port the backend listens on | `5000` |
| `DATABASE_URL` | PostgreSQL connection URL | *Required* |
| `NODE_ENV` | Mode (`development` / `production`) | `production` |
| `JWT_SECRET` | Secret key for JWT auth tokens | `stick_scape_studio_jwt_secret_key_super_secret_2026` |
| `ADMIN_EMAIL` | Initial admin account email | `admin@stickscape.com` |
| `ADMIN_PASSWORD` | Initial admin account password | `AdminPass123!` |
| `VITE_ADMIN_MOBILE` | WhatsApp notification phone number | `8754132491` |
| `VITE_API_URL` | API Base URL *(Only if frontend hosted on separate domain)* | `/api` *(relative)* |
| `FRONTEND_URL` | Allowed CORS origin *(Only if frontend hosted on separate domain)* | `http://localhost:5173` |

---

## 🧪 Local Production Test

To test the complete production build locally before hosting:

```bash
# 1. Build Frontend + Backend
npm run build

# 2. Start Production Server
npm start

# 3. Open in browser at http://localhost:5000
```
