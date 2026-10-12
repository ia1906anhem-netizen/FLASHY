# FLASHY — Security, Authorization & Privacy Architecture

## 1. Threat Model & OWASP ASVS Compliance

Security is an architectural prerequisite in FLASHY, designed against OWASP Top 10 Web Application Security Risks and OWASP ASVS standards:

| Risk Category | Mitigation in FLASHY |
| :--- | :--- |
| **Broken Access Control (A01)** | Database Row Level Security (RLS) ensures users can only read/update their own records. Server actions re-verify user role before sensitive operations. |
| **Cryptographic Failures (A02)** | All client-server communication enforces HTTPS. Private media in Supabase Storage uses signed time-limited URLs. Passwords hashed by Supabase Auth (Argon2/bcrypt). |
| **Injection (A03)** | Parameterized queries exclusively via Supabase SDK; zero raw string interpolation in SQL. Zod schema validation on all API endpoints. |
| **Insecure Design (A04)** | Financial state machine enforces mandatory 48-hour review delay. Direct client mutation of payment settlement status is impossible. |
| **Security Misconfiguration (A05)** | Service-role keys (`SUPABASE_SECRET_KEY`) strictly confined to server-side code. Never exposed in `NEXT_PUBLIC_` variables. |

---

## 2. Personal Data Protection (Law No. 91/2025/QH15 & Decree 356/2025/ND-CP)

1. **Contact Information Minimization:** Real phone numbers are hidden from public queries. In-app chat includes phone number regex detection to alert against off-platform scams.
2. **Identity Vault (KYC Documents):** Government identity cards (CCCD/Passport) are stored in an encrypted private vault. They are never rendered in public APIs and access is limited to audited admin sessions.
3. **Data Subject Rights:** Users can access, export, or submit lawful deletion requests via account settings.

---

## 3. Financial Safety & Escrow Integrity

- **Idempotency Protection:** Webhooks use unique idempotency keys (`payment_webhook_events`) to prevent replay attacks and double-crediting.
- **Atomic Database Operations:** Payment confirmation and escrow allocation occur within database transactions.
- **Strict Integer Accounting:** All balances, commissions, and payouts use integer VND values.
- **No Stored-Value Custody:** The application records state and accounting ledgers; fund custody is handled through licensed payment service providers.

---

## 4. Automated Negative Security Tests

FLASHY includes automated negative test coverage (`tests/unit/security-and-validation.test.ts`):
- Attempting to submit retouch selections exceeding package quota &rarr; Rejected with `RETENDED_LIMIT_EXCEEDED`.
- Attempting client-side total price modification &rarr; Rejected with `PRICE_TAMPERING_DETECTED`.
- Unverified freelancer attempting to accept paid orders &rarr; Blocked.
- Customer A attempting to access Customer B's private bookings &rarr; Blocked by RLS.
