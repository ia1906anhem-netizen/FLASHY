# FLASHY — System Architecture Documentation

## 1. Executive Summary

**FLASHY** is a specialized Vietnamese two-sided online marketplace connecting customers with freelance photographers for convenient, location-based photography services.

The platform operates similarly to a high-trust creative booking platform, comprising:
1. **Customer Web App:** Discovery, GPS radius search, booking wizard, cloud photo delivery review, and Flashy Coins loyalty program.
2. **Photographer Studio Portal:** Profile & portfolio albums, availability calendar, order lifecycle management, multi-category deliverable uploads, and commission-tiered earnings.
3. **Admin Control Panel:** Marketplace GMV & financial analytics, KYC document approval, escrow monitoring, dispute arbitration, and fee configuration.
4. **Backend Infrastructure:** Next.js Server Components, Route Handlers, Supabase PostgreSQL with PostGIS, Row Level Security (RLS), Supabase Storage, and a 48-hour Escrow Settlement Engine.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  Next.js 15 App Router (React 19) • Tailwind CSS • shadcn/ui • Framer Motion     |
|                                                                                   |
|  [ Customer Portal ]      [ Photographer Studio ]         [ Admin Dashboard ]     |
|  - Discovery / Maps       - Onboarding & KYC              - GMV Analytics         |
|  - 10-Step Wizard         - Multi-Asset Delivery Upload   - Dispute Resolution    |
|  - Cloud Photo Gallery    - Calendar & Blocked Slots      - Escrow Monitoring     |
|  - Loyalty & Vouchers     - Earnings & Payout Ledger      - Commission Engine     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST / Server Actions
                                          v
+-----------------------------------------------------------------------------------+
|                            APPLICATION SERVER LAYER                               |
|                  Vercel Serverless / Next.js Route Handlers                       |
|                                                                                   |
|  [ Auth & Guard ]       [ Booking Engine ]       [ Escrow & Payment Gateway ]     |
|  - Supabase Auth SSR    - Concurrency Safe       - Sandbox Adapter                |
|  - Role-Based RBAC      - Snapshot Pricing       - Webhook Signature & Idemp.     |
|  - Phone Number Masking - Quota Validation       - 48h Eligibility Cron Job       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Supabase JS SDK (RLS / Service Role)
                                          v
+-----------------------------------------------------------------------------------+
|                               SUPABASE CLOUD LAYER                                |
|                                                                                   |
|  +---------------------------+  +--------------------------+  +----------------+  |
|  |     PostgreSQL Engine     |  |     Supabase Storage     |  | Realtime & WS  |  |
|  |  - PostGIS Geolocation    |  |  - Private Bookings      |  | - Chat Engine  |  |
|  |  - Strict RLS Policies    |  |  - Portfolio Images      |  | - Booking Push |  |
|  |  - Integer VND Ledger     |  |  - KYC Evidence (Vault)  |  | - Delivery Ping|  |
|  +---------------------------+  +--------------------------+  +----------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Breakdown

| Layer | Technologies Selected | Rationale & Capabilities |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript | Server Components for fast SEO, Client Components for interactive modals, lightboxes, and calendars. |
| **Styling & UI** | Tailwind CSS, Radix UI Primitives, Lucide Icons | Accessible, responsive, mobile-first design with curated Violet/Pink palette and dark mode support. |
| **Motion** | Framer Motion | Tasteful micro-interactions, stepper transitions, and mobile filter drawers. |
| **Validation** | Zod | End-to-end type safety and schema validation across client forms and server endpoints. |
| **Database** | PostgreSQL 15+ hosted on Supabase Cloud | PostGIS extension for distance filtering, pg_trgm for fuzzy text search, and RLS for data isolation. |
| **File Storage** | Supabase Storage S3-compatible | Signed URLs for private customer deliverables; separate public buckets for portfolio galleries. |
| **Payments** | Payment Provider Interface | Pluggable architecture supporting Sandbox, MoMo, ZaloPay, and VietQR with cryptographic webhook verification. |

---

## 4. Key Subsystem Workflows

### 4.1 The 48-Hour Escrow Settlement Lifecycle
1. **Deposit Escrow:** Customer completes 30% deposit checkout. Payment webhook confirms transaction; funds enter `HELD_BY_PROVIDER` status.
2. **Shooting Session:** Photographer arrives and conducts session.
3. **Validated Delivery:** Photographer uploads deliverables via Supabase Storage. Delivery count is verified server-side.
4. **48-Hour Review Window Starts:** The trusted server timestamp initiates the review window. Customer receives preview assets with watermarks.
5. **Retouch Selection:** Customer picks photos up to package quota (e.g., 10 photos).
6. **Customer Acceptance:** Customer clicks "Duyệt & Nhận ảnh". Original high-res assets unlock. Per strict business rule 6.3.11, acceptance does *not* bypass the mandatory 48-hour release delay.
7. **Dispute Handling:** If customer files a complaint, escrow immediately freezes into `DISPUTED` state, preventing release until Admin adjudication.
8. **Automated Payout Release:** After 48 hours without disputes, protected background job marks funds as `RELEASED` to photographer withdrawable balance.

### 4.2 Geolocation & Radius Search
- Photographers store `(latitude, longitude)` and `service_radius_km`.
- Search queries use PostGIS `ST_DWithin` on `geography(Point, 4326)` to return only freelancers capable of traveling to the customer's specified shooting spot.
- Exact private GPS coordinates of customers are never exposed in public endpoints.
