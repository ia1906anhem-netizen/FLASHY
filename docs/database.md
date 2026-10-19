# FLASHY — Database Schema & Data Modeling

## 1. Overview & PostgreSQL Extensions

FLASHY uses PostgreSQL 15+ hosted on Supabase Cloud. The database enforces strict referential integrity, check constraints, integer financial accounting, and Row Level Security (RLS) on all tables.

### Required Extensions
- `uuid-ossp` & `pgcrypto`: Cryptographic UUIDs and webhook hashing.
- `postgis`: Spatial data types (`geography(Point, 4326)`) and radius distance queries.
- `pg_trgm`: Trigram fuzzy search indexing across photographer profiles, bios, and styles.

---

## 2. Core Tables by Domain

### 2.1 Profiles & Authentication
- `profiles`: Extends Supabase `auth.users` with `full_name`, `avatar_url`, `phone`, `role` (`CUSTOMER`, `PHOTOGRAPHER`, `ADMIN`).
- `user_addresses`: Multi-address storage with PostGIS `location GEOGRAPHY(POINT, 4326)`.
- `user_preferences`: Notification and language toggles.

### 2.2 Photographer Profiles & Catalog
- `photographer_profiles`: Freelancer metadata (`slug`, `bio`, `city`, `district`, `service_radius_km`, `kyc_status`, `is_available`, `avg_rating`, `total_reviews`).
- `service_packages`: Standard packages according to CP3 (FLASHY EXPRESS, FLASHY CASUAL, FLASHY PRO, FLASHY SIGNATURE).
- `package_addons`: Makeup, hair styling, outfit rentals, express delivery.
- `photographer_packages`: Custom pricing and add-on assignments per freelancer.
- `portfolio_images`: Public portfolio items with sort orders.

### 2.3 Bookings & State Machines
- `bookings`: Central order entity (`booking_number`, `customer_id`, `photographer_id`, `package_id`, `status`, `shooting_date`, `shooting_time`, `total_amount`, `deposit_amount`).
- `booking_status_history`: Immutable transition log with `actor_id`, `actor_role`, and timestamp.
- `booking_addons`: Selected add-on services snapshot.

### 2.4 Financial Records & Escrow
- `payments`: Transaction records (`payment_method`, `provider_transaction_id`, `status`).
- `escrow_records`: Ký quỹ records (`gross_amount`, `commission_amount`, `net_amount`, `delivery_confirmed_at`, `review_window_ends_at`, `released_at`).
- `payment_webhook_events`: Idempotency tracking table preventing duplicate webhook replays.
- `commission_rules`: System fee configurations.
- `withdrawal_requests`: Freelancer payout requests to Vietnamese bank accounts.

### 2.5 Cloud Delivery & Messaging
- `booking_deliveries`: Delivery milestone tracker (`original_count`, `edited_count`, `retouch_count`).
- `photo_assets`: Delivery items with `category` (`original`, `edited`, `retouched`, `preview`) and `is_watermarked` flag.
- `conversations` & `messages`: Supabase Realtime chat messages with attachment support.

---

## 3. Row Level Security (RLS) Matrix

| Table | Public Access | Customer Access | Photographer Access | Admin Access |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Read display names / avatars | Read/Update own profile | Read/Update own profile | Full CRUD |
| `photographer_profiles` | Read approved & verified | Read approved | Read/Update own profile | Full CRUD |
| `bookings` | None | Read/Insert own bookings | Read/Update assigned bookings | Full CRUD |
| `photo_assets` | None | Read watermarked / delivered | Upload & manage own bookings | Full CRUD |
| `escrow_records` | None | Read own booking escrow status | Read own payout records | Full CRUD |
| `disputes` | None | Read/Insert own disputes | Read assigned disputes | Full CRUD |
| `admin_audit_logs` | None | None | None | Read/Insert only |

---

## 4. Concurrency Protection & Trigger Functions

1. **Booking Collision Prevention:** A trigger checks for overlapping confirmed bookings for the same photographer within the same time window before insertion.
2. **Review Window Auto-Calculation:** When delivery status updates to `DELIVERED`, a trigger automatically computes `review_window_ends_at = NOW() + INTERVAL '48 hours'`.
3. **Loyalty Tier Auto-Promotion:** When coins change on `loyalty_accounts`, the membership tier (`ROOKIE` &rarr; `CREATOR` &rarr; `ICON`) recalculates automatically.
