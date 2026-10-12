# FLASHY — Production Readiness Checklist

Before transitioning FLASHY from Sandbox / Pilot to handling live customer funds and real photography services in Vietnam, the following requirements must be verified and completed:

---

## 1. Legal & Regulatory Compliance (Vietnam)

- [ ] **Ministry of Industry and Trade (Bộ Công Thương):** Complete e-commerce marketplace notification/registration via `online.gov.vn` under Decree 52/2013/ND-CP and Decree 85/2021/ND-CP.
- [ ] **Personal Data Protection (Luật 91/2025/QH15 & Nghị định 356/2025/NĐ-CP):**
  - [ ] Appoint Data Protection Officer (DPO).
  - [ ] Complete Data Protection Impact Assessment (DPIA) file.
  - [ ] Enforce consent records and data deletion workflows.
- [ ] **Consumer Protection Law No. 19/2023/QH15:** Public display of dispute resolution procedures, pricing policies, and terms of service.
- [ ] **Payment Intermediary Law:** Formalize merchant acquiring agreement with a licensed Vietnamese payment service provider (MoMo, ZaloPay, Vietcombank, or VNPay).

---

## 2. Financial & Accounting Safeguards

- [ ] Ensure all financial ledgers operate strictly with integer Vietnamese Dong (VND).
- [ ] Verify that the application database does not act as an unlicensed stored-value wallet.
- [ ] Validate HMAC SHA-256 signatures on all live incoming payment webhooks.
- [ ] Confirm idempotency tables block duplicate webhook transactions.
- [ ] Confirm dispute filing automatically freezes escrow payout release.
- [ ] Verify that client satisfaction acceptance does not bypass the mandatory 48-hour delay window.

---

## 3. Security & Infrastructure Controls

- [ ] Row Level Security (RLS) enabled on 100% of public tables in PostgreSQL.
- [ ] `SUPABASE_SECRET_KEY` is never referenced in client-side code or public bundles.
- [ ] High-resolution photography deliverables protected by signed URLs with limited expiration.
- [ ] Phone number masking and regex detection active in messaging channels.
- [ ] Identity documents (CCCD/Passport) stored in a private, encrypted vault with restricted admin-only audit logging.
- [ ] Automated regression tests passing in CI/CD pipeline.
