# FLASHY — API Architecture & Contracts

## 1. Overview

FLASHY uses Next.js Route Handlers with Zod validation, HTTP status codes, structured JSON error handling, and server-side Supabase client verification.

---

## 2. API Routes Catalog

### 2.1 Photographers

#### `GET /api/photographers`
Returns filtered list of approved photographers.
- **Query Parameters:**
  - `q`: Search keyword (name, style, bio)
  - `district`: Target district in Ho Chi Minh City
  - `category`: Photography style (`lifestyle`, `street`, `couple`, etc.)
- **Response `200 OK`:**
  ```json
  {
    "data": [
      {
        "id": "p-1",
        "display_name": "Minh Trí (TriStreet)",
        "district": "Quận 1",
        "starting_price": 89000,
        "average_rating": 4.95,
        "is_verified": true
      }
    ],
    "total": 1,
    "error": null
  }
  ```

---

### 2.2 Bookings

#### `POST /api/bookings`
Creates a new photography booking with concurrency checks and pricing snapshot.
- **Request Body:**
  ```json
  {
    "photographer_id": "p-1",
    "package_id": "pkg-3",
    "shooting_date": "2026-04-15",
    "shooting_time": "15:30",
    "location_name": "Bến Bạch Đằng, Quận 1",
    "concept_notes": "Chụp màu film vintage",
    "package_price": 450000,
    "addons_total": 150000,
    "total_amount": 550000,
    "deposit_amount": 165000,
    "payment_method": "sandbox"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "data": {
      "booking_number": "BK-892104",
      "status": "CONFIRMED",
      "deposit_amount": 165000
    },
    "error": null
  }
  ```
- **Response `409 Conflict`:** Returned if time slot was concurrently booked by another customer.

---

### 2.3 Payments & Escrow

#### `POST /api/payments/checkout`
Initializes a payment session.
- **Request Body:**
  ```json
  {
    "booking_id": "BK-892104",
    "amount": 165000,
    "payment_method": "sandbox"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "data": {
      "transaction_id": "TX-174123891",
      "status": "FUNDS_CONFIRMED",
      "is_sandbox": true,
      "notice": "Thanh toán thử nghiệm – Không phát sinh giao dịch thật"
    },
    "error": null
  }
  ```

#### `POST /api/webhooks/payments/[provider]`
Cryptographically signed webhook handler.
- **Headers:** `x-signature: <hmac_sha256_hash>`
- **Response `200 OK`:** Acknowledges processing with idempotency guarantee.

#### `GET /api/cron/release-escrow`
Scheduled background job checking for 48-hour delivery maturity.
- **Headers:** `Authorization: Bearer <CRON_SECRET>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "released_count": 2,
    "released_bookings": ["BK-512984"]
  }
  ```

---

### 2.4 Cloud Deliverables & Retouch Selection

#### `POST /api/deliveries/[id]/retouch-selection`
Submits selected photos for advanced retouching.
- **Request Body:**
  ```json
  {
    "booking_id": "BK-892104",
    "selected_photo_ids": ["photo-1", "photo-3"],
    "max_allowed_quota": 10
  }
  ```
- **Response `200 OK`:** Confirms selection.
- **Response `422 Unprocessable Entity`:** Returned if count exceeds package quota.

---

### 2.5 Disputes

#### `POST /api/disputes`
Opens a customer dispute and instantly freezes escrow release.
- **Request Body:**
  ```json
  {
    "booking_id": "BK-892104",
    "reason": "late_delivery",
    "description": "Thợ ảnh trễ hạn giao file 3 ngày không lý do."
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "data": {
      "id": "DISP-1029",
      "status": "OPEN",
      "escrow_frozen": true
    },
    "error": null
  }
  ```
