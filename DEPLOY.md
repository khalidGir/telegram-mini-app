# Deployment Plan — Creator Store Mini App

## Overview

Three components, all on free tiers:

| Component | Platform | Type |
|-----------|----------|------|
| Frontend | Vercel | Static SPA |
| Backend API | Vercel | Serverless functions |
| Bot | Render (free) | Always-on Node.js process |

---

## Prerequisites

1. **Supabase project** — created at https://supabase.com
2. **Vercel account** — https://vercel.com (free tier)
3. **Render account** — https://render.com (free tier)
4. **Telegram Bot** — created via @BotFather, you have the `BOT_TOKEN`

---

## Step 1 — Supabase Database

1. Go to your Supabase project → **SQL Editor**
2. Copy the contents of `supabase/schema.md` into the SQL editor
3. **Remove all markdown** — keep only the SQL code blocks (tables, indexes, RLS policies, triggers, seed data)
4. Run the SQL
5. Note your **Project URL** and **Service Role Key** (Settings → API)

---

## Step 2 — Backend API (Vercel)

### Connect to Vercel

1. Push your repo to GitHub
2. Go to Vercel → **New Project** → Import your repo
3. Set **Root Directory** to: `backend`
4. Configure **Environment Variables**:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `BOT_TOKEN` | Your Telegram bot token from @BotFather |

5. Click **Deploy**
6. Note the deployed URL: `https://your-backend.vercel.app`

### Verify

```
curl https://your-backend.vercel.app/health
# Should return: {"status":"ok"}
```

---

## Step 3 — Frontend (Vercel)

### Connect to Vercel

1. Vercel → **New Project** → Import your repo
2. Set **Root Directory** to: `frontend`
3. Configure **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app` (from Step 2) |

4. Click **Deploy**
5. Note the deployed URL: `https://your-frontend.vercel.app`

---

## Step 4 — Telegram Bot (Render)

### Create Web Service on Render

1. Go to Render → **New** → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to: `bot`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Configure **Environment Variables**:

| Variable | Value |
|----------|-------|
| `BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `APP_URL` | `https://your-frontend.vercel.app` (from Step 3) |

7. Click **Create Web Service**
8. Wait for deployment to finish

### Alternative: Run Bot Locally (for testing)

```bash
cd bot
cp .env.example .env
# Edit .env with your BOT_TOKEN and APP_URL
npm install
npm run dev
```

---

## Step 5 — Connect Bot to Telegram Mini App

1. Open Telegram → find your bot
2. Send `/start`
3. You should see a welcome message with an **"🏪 Open Store"** button
4. Tap the button → your Vercel frontend should open inside Telegram

---

## Step 6 — Configure Bot Menu Button

To set the Mini App as the bot's menu button:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{"menu_button":{"type":"web_app","text":"🏪 Store","web_app":{"url":"https://your-frontend.vercel.app"}}}'
```

---

## Env Variable Summary

### Backend (Vercel)

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
BOT_TOKEN=123456:ABC-DEF...
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.vercel.app
```

### Bot (Render)

```
BOT_TOKEN=123456:ABC-DEF...
APP_URL=https://your-frontend.vercel.app
```

---

## Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| **Vercel (Frontend)** | 100GB bandwidth/mo | More than enough for mini app |
| **Vercel (Backend)** | 100GB bandwidth, serverless invocations | Cold starts ~1-2s, fine for low traffic |
| **Render (Bot)** | 750 hrs/mo free | Spins down after 15min idle, auto-wakes on request |
| **Supabase** | 500MB DB, 1GB storage, 2 projects free | Sufficient for thousands of products |

---

## Project Structure

```
creator-store-miniapp/
├── backend/                # Vercel serverless API
│   ├── api/
│   │   ├── lib/            # Shared utilities
│   │   │   ├── supabase.ts # Supabase client
│   │   │   └── auth.ts     # Telegram HMAC auth
│   │   ├── products.ts     # GET/POST/PATCH/DELETE /api/products
│   │   ├── creators.ts     # GET /api/creators
│   │   ├── categories.ts   # GET /api/categories
│   │   ├── orders.ts       # GET/POST/PATCH /api/orders
│   │   └── health.ts       # GET /health
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── vercel.json
├── frontend/               # Vercel static SPA
│   ├── src/
│   │   ├── api/client.ts   # Axios API client
│   │   ├── hooks/          # useTelegram, useProducts, useOrders
│   │   ├── components/     # ProductCard, Header, CategoryFilter
│   │   ├── pages/          # Home, ProductDetail, CreatorStore, Orders, CreateProduct
│   │   ├── types/index.ts  # TypeScript interfaces
│   │   ├── App.tsx         # Router
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── vercel.json
├── bot/                    # Render always-on bot
│   ├── src/index.ts        # Grammy bot entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── supabase/
    └── schema.md           # Database schema (markdown)
```

---

## Troubleshooting

### "Missing X-Telegram-Init-Data header"
- Frontend not running inside Telegram WebView
- Test by opening via bot's `/start` button, not directly in browser

### "Invalid authentication"
- `BOT_TOKEN` in backend env vars doesn't match the bot that generated the WebApp initData
- Double-check both are the same bot

### "Failed to fetch products"
- Check backend Vercel logs for Supabase errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct

### Bot not responding
- Check Render logs for crash errors
- Verify `BOT_TOKEN` is correct
- Only one process can poll the bot at a time (stop local if running on Render)

### Vercel serverless cold starts
- First request after inactivity takes 1-3 seconds
- Normal for free tier. Use a keep-alive service or upgrade if needed.
