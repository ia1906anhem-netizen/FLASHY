# FLASHY — Deployment & Operations Guide

## 1. Prerequisites

- Node.js 18.18+ or 20.x
- Vercel account
- Supabase Cloud project
- GitHub repository

---

## 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Under **Database &rarr; Extensions**, ensure `postgis`, `pgcrypto`, `uuid-ossp`, and `pg_trgm` are enabled.
3. In the **SQL Editor**, execute the migration script:
   ```sql
   -- Copy and run: supabase/migrations/001_initial_schema.sql
   ```
4. Create the following Storage Buckets in **Storage**:
   - `portfolio-photos` (Public bucket)
   - `booking-deliverables` (Private bucket with signed URLs)
   - `kyc-vault` (Private encrypted bucket)
5. Retrieve your project API credentials from **Project Settings &rarr; API**:
   - `Project URL`
   - `anon` / `public` API key
   - `service_role` Secret key (Keep server-side only!)

---

## 3. Environment Variables Configuration

Create `.env.local` based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_SECRET_KEY="your-service-role-key"

# App & Public URLs
NEXT_PUBLIC_APP_URL="https://flashy.vn"

# Security & Cron Secrets
CRON_SECRET="your-high-entropy-cron-secret-32-chars"
PAYMENT_WEBHOOK_SECRET="your-hmac-webhook-secret"

# Payment Providers (Sandbox by default)
PAYMENT_PROVIDER_SANDBOX="true"
MOMO_PARTNER_CODE=""
MOMO_ACCESS_KEY=""
MOMO_SECRET_KEY=""
```

---

## 4. Vercel Deployment

1. Push your repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** &rarr; **Import Git Repository**.
3. Framework Preset: **Next.js**.
4. Add all environment variables listed above under **Environment Variables**.
5. Click **Deploy**.
6. Set up Vercel Cron in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/release-escrow",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```
