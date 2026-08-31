# 🌿 MedInVedic — Production Healthcare Platform + Monetization + Payments + Automation
## Master Architecture & Implementation Plan

---

## 1. Executive Summary & Identity
- **Product Name**: MedInVedic
- **Tagline**: Where Modern Medicine Meets Ancient Ayurveda
- **Live URL**: [https://medinvedic.web.app](https://medinvedic.web.app)
- **Primary Market**: India (Initial Focus: Pune Metropolitan Area)
- **Founder**: Mahesh Badiger
- **Revenue Target**: ₹1,00,000+ Monthly Gross Platform Revenue (Target model with diversified streams: Consultations, Pharmacy commissions, Health memberships, Clinic/Lab leads, Speed Learning).

---

## 2. Current vs. Target Architecture

```
                               CURRENT ARCHITECTURE
                                    MEDINVEDIC
                                         │
                                  Firebase Hosting
                                         │
                    ┌────────────────────┴───────────────────┐
                    │                                        │
             Vanilla JS UI                             Firebase Auth
                    │                                        │
           Mock & Prototype Endpoints               Partial Cloud Functions
                    │                                        │
           Client-Side Price State              Direct Client Writes to Collections
```

```
                               TARGET ARCHITECTURE
                                    MEDINVEDIC
                                         │
                                  Firebase Hosting
                                         │
                    ┌────────────────────┴───────────────────┐
                    │                                        │
          Vanilla JS UI (White Glass)                  Firebase Auth
                    │                                        │
                    └────────────────────┬───────────────────┘
                                         │
                              Firebase Cloud Functions / 
                              Express Production Backend
                                         │
        ┌───────────────────┬────────────┴────────────┬───────────────────┐
        │                   │                         │                   │
    Firestore            Razorpay             WhatsApp/Email          Audit Logs
 (RBAC Protected)   (Signature & Webhook)   (Event Automation)    (Immutable Trail)
        │                   │                         │                   │
        └───────────────────┴────────────┬────────────┴───────────────────┘
                                         │
                            Admin Intelligence Dashboard
                                         │
                             Revenue Analytics & Reports
```

---

## 3. Database Schema & Collections

| Collection | Description | Access Control |
|---|---|---|
| `users/{uid}` | User profiles, membership status, contact, roles (`customer`, `doctor`, `pharmacy`, `clinic`, `lab`, `admin`, `superadmin`) | User read/update own; Admin full |
| `doctors/{doctorId}` | Verified practitioner profiles, registration number, consultation fees, city, availability | Public read; Admin write |
| `pharmacies/{pharmacyId}` | Licensed pharmacy partners, address, phone, commission configuration | Public read; Admin write |
| `clinics/{clinicId}` | Partner clinics and specialized wellness centers | Public read; Admin write |
| `labs/{labId}` | Diagnostic laboratories and test catalog | Public read; Admin write |
| `products/{productId}` | Modern OTC/Rx and Ayurvedic inventory, selling prices, prescription requirements | Public read; Admin write |
| `orders/{orderId}` | Order state machine (`CREATED` → `PAYMENT_PENDING` → `PAID` → `CONFIRMED` → `PROCESSING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED` / `CANCELLED` / `REFUNDED`) | Buyer & assigned partner read; Server write |
| `payments/{paymentId}` | Payment records, Razorpay order/payment IDs, signatures, amounts, statuses (`PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`) | Buyer read; Server write |
| `consultations/{consultId}` | Doctor consultation bookings (`REQUESTED`, `BOOKED`, `DOCTOR_ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) | Patient & Doctor read; Server write |
| `subscriptions/{subId}` | Healthcare memberships (`CARE_MONTHLY` ₹99, `CARE_YEARLY` ₹999), statuses (`ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`) | Subscriber read; Server write |
| `leads/{leadId}` | Clinic/Lab/Doctor/Pharmacy lead generation records | Admin read/write |
| `notifications/{notifId}`| Dispatch queue for WhatsApp, Email, and In-App notifications | Recipient read |
| `webhookEvents/{eventId}`| Idempotency ledger preventing duplicate Razorpay webhook execution | Server internal |
| `referrals/{refId}` | Referral tracking with fraud and self-referral prevention | Referrer read; Server write |
| `settings/pricing` | Centralized business pricing config (eliminating hardcoded values) | Admin write; Public read |
| `auditLogs/{logId}` | Immutable administrative action history | Admin read only; Server write |

---

## 4. Payment & Razorpay Architecture
1. **Server-Side Price Authority**: The frontend never determines the transaction amount. The server queries Firestore / DB for trusted item and consultation prices and computes subtotals, platform fees, delivery fees, and taxes.
2. **Razorpay Order Creation**: `/api/payments/create-order` creates a verified Razorpay order with authoritative currency (`INR`) and receipt ID.
3. **Checkout & Signature Verification**: `/api/payments/verify` computes HMAC SHA256 (`order_id + "|" + payment_id`) using the server-side secret key.
4. **Webhook Idempotency**: `/api/webhooks/razorpay` verifies `X-Razorpay-Signature`, checks `webhookEvents/{eventId}`, updates order state to `PAID`, and dispatches notification events.
5. **Refunds Engine**: `/api/payments/refund` triggers automated partial or full refunds through Razorpay API and updates Firestore state.

---

## 5. Security & Isolation Rules
- **`firestore.rules`**: Production-grade security rules denying client-side modification of `paymentStatus`, `orderStatus`, `total`, `role`, `commission`, and `refundStatus`.
- **`storage.rules`**: Restricts `/prescriptions/` access to authenticated uploaders and licensed pharmacists/admins.
- **Zero Exposed Secrets**: Moving all API keys, Razorpay secret keys, JWT secrets, and AI keys to environment configuration (`.env.example` provided with safe placeholders).
- **Strict Domain Isolation**: Separating medical knowledge RAG and VedicMind mathematical learning.

---

## 6. Business Model & Monetization Targets (₹1,00,000+/Month)
- **Doctor Consultations Platform Fees**: ₹12,500+/month (Platform cut per booking).
- **Pharmacy Partner Commissions**: ₹15,000+/month (Configurable 5-15% commission on medicine orders).
- **Care Memberships (Care Monthly ₹99 / Care Yearly ₹999)**: ₹39,600+/month.
- **Clinic & Lab Lead Generation**: ₹20,000+/month (Qualified patient leads).
- **VedicMind AI Speed Aptitude Premium**: ₹12,900+/month.
- **Total Monthly Platform Target**: **₹1,00,000+ Gross Platform Revenue**.

---

## 7. Implementation Roadmap
- [x] **Phase 1: Project Audit & Baseline Snapshot** (Completed Git checkpoint).
- [ ] **Phase 2: Backend Cloud Functions & API Hardening** (`payments`, `webhooks`, `orders`, `consultations`, `subscriptions`, `notifications`, `pricing`).
- [ ] **Phase 3: Security & Storage Rules** (`firestore.rules`, `storage.rules`, `.env.example`).
- [ ] **Phase 4: Frontend Payment, Consultation, Order & Membership Polish** (Consistent white glassmorphism + peace green UI).
- [ ] **Phase 5: Admin Control Center & Revenue Intelligence** (Live revenue KPI dashboards, leads, audit logs, partner management).
- [ ] **Phase 6: Automated Test Suite** (End-to-end tests for Razorpay flow, signature validation, idempotency, RBAC).
- [ ] **Phase 7: Documentation & Firebase Deployment**.
