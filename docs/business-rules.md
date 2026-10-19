# FLASHY — Marketplace Business Rules Specification

## 1. Photography Packages & Standard Pricing

FLASHY defines 4 standard service packages, allowing photographers to configure custom pricing within permitted bounds:

| Package | Typical Duration | Base Price (VND) | Deliverable Standards | Retouch Quota | Delivery Deadline | Equipment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FLASHY EXPRESS** | 45–60 minutes | 350,000 | 5–10 color-edited photos + All originals | 0 photos | Same-day / AirDrop / Drive | Flagship Phone |
| **FLASHY CASUAL** | 90 minutes | 800,000 | 10 color-edited photos (5 retouch) + All originals | 5 photos | 3–5 days | Basic Camera |
| **FLASHY PRO** | 120 minutes | 1,500,000 | 15 color-edited photos (10 retouch) + All originals | 10 photos | 5–7 days | Pro Camera + Reflector |
| **FLASHY SIGNATURE** | 150 minutes | 3,200,000 | 20 color-edited photos (15 retouch) + All originals | 15 photos | 7–10 days | High-end Camera + Studio Lights |

### Add-On Services (Tùy chọn cộng thêm)
- **Trang điểm & Làm tóc:** 150,000 VND (Makeup look tự nhiên phong cách Hàn Quốc/Daily).
- **Thuê Trang Phục / Áo Dài:** 120,000 VND per concept set.
- **Express 24h Delivery:** 100,000 VND priority queue.
- **Additional Retouch:** 80,000 VND per 5 additional photos.

---

## 2. Commission Engine & Precedence Rules (CP3 Standard)

FLASHY operates a fixed 15% platform take rate with transparent financial ledger:

### Core Rules
1. **Fixed Platform Take Rate (15%):** Sàn FLASHY trích cố định 15% từ giá gói dịch vụ gốc cho cả 4 gói CP3.
2. **Photographer Net Payout (85%):** Nhiếp ảnh gia nhận trọn 85% thù lao giá gói gốc.
3. **Add-Ons & Travel Policy (100% to Photographer):** Nhiếp ảnh gia nhận trọn 100% phụ phí Add-ons / di chuyển ngoại thành. FLASHY không trích hoa hồng trên phụ phí (0% commission).
4. **Star of the Quarter Incentive:** 0% commission trong tháng thưởng dành cho thợ đạt danh hiệu xuất sắc (≥30 đơn hoàn thành & Rating ≥4.8).

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
