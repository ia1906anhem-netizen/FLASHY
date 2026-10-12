# FLASHY — External Integrations & Service Providers

## 1. Provider Integration Strategy

To maintain high architectural integrity, FLASHY uses an extensible provider adapter interface. When third-party merchant credentials or government approvals are pending, the application operates in clearly labeled **Sandbox Mode** rather than fabricating successful live transactions.

---

## 2. Integration Matrix

| Subsystem | Target Live Provider | Sandbox Implementation | Configuration Status |
| :--- | :--- | :--- | :--- |
| **Database & Auth** | Supabase Cloud | Local / Mock SDK Fallback | Ready with migration scripts |
| **File Storage** | Supabase Storage S3 | Local / CDN Unsplash Preview | Ready with signed URLs |
| **E-Wallets** | MoMo / ZaloPay / ShopeePay | Sandbox Mock Checkout (`is_sandbox: true`) | Provider Adapter Ready |
| **Bank QR** | VietQR (NAPAS 247) | Dynamic QR Generator Mock | Template Configured |
| **Map & Geolocation** | Goong Maps / Google Maps | PostGIS Geo Point Calculation + SVG Vector Visualizer | PostGIS Enabled |
| **SMS OTP** | SpeedSMS / eSMS | Supabase Email Auth Active | Adapter Interface Ready |
| **Identity KYC** | VNPT eKYC / FPT.AI | Synthetic KYC Fixtures (`KYC-SYNTH-8921`) | Audit Flow Active |

---

## 3. Sandbox Checkout Notice

Whenever sandbox checkout is invoked, the UI renders the explicit regulatory notice:
> **"Thanh toán thử nghiệm – Không phát sinh giao dịch thật"**

No simulated transaction is ever recorded or presented as real collected fiat currency.
