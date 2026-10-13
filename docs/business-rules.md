# FLASHY — Marketplace Business Rules Specification

## 1. Photography Packages & Standard Pricing

FLASHY defines 4 standard service packages, allowing photographers to configure custom pricing within permitted bounds:

| Package | Typical Duration | Base Price Range (VND) | Deliverable Standards | Retouch Quota | Delivery Deadline |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Flash Shot** | 15–20 minutes | 79,000 – 99,000 | 1 location • All original RAW/JPG (~30) • 3–5 color-edited photos | 0 photos | 2 days |
| **Quick Date** | 30–60 minutes | 150,000 – 300,000 | 1–2 nearby spots (&lt;3km) • All original (~100) • 15 color-edited photos | 5 photos | 3 days |
| **Vibe Sài Gòn** | 2–3 hours | 400,000 – 700,000 | 2–3 urban locations • All original (~250) • 40 color-edited photos | 10 photos | 4 days |
| **Outdoor / Dã ngoại** | Half-day (4h) | 800,000 – 1,500,000 | Concept shoot • All original (~400) • 60 color-edited photos | 20 photos | 5 days |

### Add-On Services (Tùy chọn cộng thêm)
- **Makeup & Hair:** 100,000 – 250,000 VND (Default: 150,000 VND).
- **Outfit Rental:** 120,000 VND per concept set.
- **Express 24h Delivery:** 100,000 VND priority queue.
- **Additional Retouch:** 80,000 VND per 5 additional photos.

---

## 2. Commission Engine & Precedence Rules

FLASHY operates a tiered commission engine with snapshotting on order creation:

### Precedence Hierarchy
1. **Priority 1 — Star of the Quarter Promotional Benefit:** 0% commission on the next 10 eligible bookings.
2. **Priority 2 — New Photographer Welcome Incentive:** 0% commission on the photographer's first 3 completed bookings.
3. **Priority 3 — Returning Customer Retention Rate:** 4.0% commission when an existing customer books the same photographer.
4. **Priority 4 — Standard Package Commission:**
   - *Flash Shot & Quick Date:* 6.0% platform fee.
   - *Vibe Sài Gòn & Outdoor:* 9.0% platform fee.

### Add-On & Partner Commission Rules
5. **Dịch vụ Makeup / Làm tóc:** 10.0% hoa hồng nền tảng (Áp dụng cho Makeup Artist tự do liên kết sàn).
6. **Dịch vụ Thuê trang phục & Phụ kiện:** 10.0% – 12.0% (Chiết khấu trích từ các Shop thời trang đối tác liên kết).

*Note: All monetary transactions are calculated as integer Vietnamese Dong (VND) amounts. Floating-point calculations are strictly forbidden.*

---

## 3. Escrow Settlement & 48-Hour Review Window

1. **Mandatory 48-Hour Delay:** Payouts cannot be released until at least 48 hours have elapsed from verified delivery completion.
2. **Acceptance Policy:** A customer clicking "Duyệt & Nhận ảnh" records customer satisfaction and unlocks original unwatermarked assets, but **does not bypass** the mandatory 48-hour release delay (Rule 6.3.11).
3. **Dispute Block:** Filing a dispute instantly freezes escrow funds into `DISPUTED` status, indefinitely halting automated payouts until Admin resolution.
4. **Automated Release:** A server-controlled background job verifies:
   - Confirmed customer deposit.
   - Verified photo deliverables exist.
   - At least 48 hours have elapsed.
   - No open dispute or refund processing.
   - No duplicate payout executed.

---

## 4. Loyalty Program: Flashy Coins

- **Earning Formula:** Customers earn 2% of completed booking values converted into Flashy Coins (min 10, max 500 coins per booking).
- **Membership Tiers:**
  - **Rookie Tier:** 0 – 199 Coins.
  - **Creator Tier:** 200 – 499 Coins (Priority editing, quarterly voucher).
  - **Icon Tier:** 500+ Coins (VIP support, complimentary styling addon).
- **Points Ledger:** Points are tracked via an immutable append-only ledger (`EARNED`, `REDEEMED`, `EXPIRED`, `ADJUSTMENT`). Editable balance fields without transaction history are prohibited.

---

## 5. Photographer Gamification: Star of the Quarter

- **Qualification Criteria:**
  - Completed &ge; 30 eligible bookings within the calendar quarter in Vietnam timezone (`Asia/Ho_Chi_Minh`).
  - Average customer rating &ge; 4.8 / 5.0.
- **Rewards:**
  - Golden Badge displayed on public profile cards.
  - 10 future bookings with 0% platform fee.
  - Sponsored placement boost in discovery feeds.
