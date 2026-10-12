# FLASHY — Photographer Booking & Creative Experience Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-yellow)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

**FLASHY** is a modern Vietnamese online marketplace connecting customers with freelance photographers for affordable, convenient, location-based photography services.

---

## 🚀 Key Platform Features

### 1. Customer Web Portal
- **Discovery & Radius Search:** Search photographers by style (Lifestyle, Street, Couple, Vintage, Áo dài, Outdoor), district in Ho Chi Minh City, or GPS radius with interactive Map and Grid views.
- **10-Step Booking Wizard:** Select package, date/time, location, add-on services (makeup, outfit, express delivery), voucher code, and checkout.
- **Escrow 48-Hour Protection:** Deposits are securely held in escrow; automatic payout to freelancers is delayed by 48 hours for customer inspection.
- **Cloud Photo Deliverables Viewer:** Watermarked previews, photo retouch selection up to package quota, acceptance action, and download.
- **Loyalty Program:** Flashy Coins ledger (2% back per completed booking), membership tiers (Rookie, Creator, Icon), and voucher exchange store.
- **Privacy-Guarded Chat:** In-app real-time messaging with phone number detection warnings to prevent off-platform transaction risks.

### 2. Photographer Studio Portal
- **Onboarding & KYC:** Profile creation, operating radius slider, portfolio album builder, and synthetic KYC identity verification.
- **Calendar & Availability:** Monthly and day-slot scheduler preventing booking collisions.
- **Order Lifecycle Management:** Arrival check-in, shoot start, shoot completion, and direct multi-category cloud asset delivery.
- **Authoritative Earnings Ledger:** Transparent platform commission calculations (0% for first 3 bookings, 6% standard, 9% outdoor, 4% returning customers).
- **Payout Requests:** Bank account registration and withdrawal management.
- **Gamification:** Star of the Quarter qualifications and 0% commission rewards.

### 3. Admin Control Panel
- **Overview Dashboard:** Gross Merchandise Value (GMV), platform commission net revenue, active bookings, and dispute alerts.
- **KYC Verification Panel:** Synthetic identity review with approval, rejection, and audit trails.
- **Escrow Administration:** 48-hour review window monitoring and release eligibility trigger.
- **Dispute Arbitration:** Evidence inspection, refund to customer, or payout release decisions.
- **Commission Rules Engine:** Dynamic fee rates configurator.
- **User & Voucher Management:** User account suspension and promotional voucher distribution.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript strict mode, Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide React, Framer Motion.
- **Backend & Database:** Supabase PostgreSQL 15+, PostGIS spatial extensions, Row Level Security (RLS), Supabase Storage with signed URLs, Next.js Server Components & Route Handlers.
- **Testing:** Vitest automated test suite covering pricing, commission rules, escrow review windows, and negative security scenarios.

---

## 📦 Getting Started

### 1. Installation

```bash
git clone https://github.com/your-org/flashy.git
cd flashy
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

### 3. Database Migration

Run the PostgreSQL migration in Supabase SQL Editor:
```bash
# File: supabase/migrations/001_initial_schema.sql
```

### 4. Running Locally

```bash
# Start development server
npm run dev

# Run automated tests
npm test

# Run TypeScript type check
npm run type-check
```

---

## 🧪 Test Suite Execution

All business logic, financial math, escrow delay rules, and negative security tests are verified:

```bash
$ npm test

 ✓ tests/unit/escrow-and-review.test.ts (5 tests)
 ✓ tests/unit/pricing-and-commission.test.ts (6 tests)
 ✓ tests/unit/security-and-validation.test.ts (6 tests)

 Test Files  3 passed (3)
      Tests  17 passed (17)
```

---

## 📖 Comprehensive Documentation

- [Architecture & Subsystems](docs/architecture.md)
- [Database Schema & RLS Matrix](docs/database.md)
- [API Contracts & Endpoints](docs/api.md)
- [Security, Authorization & Privacy](docs/security.md)
- [Business Rules Specification](docs/business-rules.md)
- [External Integrations & Sandbox](docs/integrations.md)
- [Deployment Guide (Vercel & Supabase)](docs/deployment.md)
- [Production Readiness Checklist](docs/production-readiness.md)
