# 🏛️ MedInVedic Architecture Specification

## 1. High-Level Architecture

```
                               ┌─────────────────────────┐
                               │   MedInVedic Clients    │
                               │  (Mobile Web / Android) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │    Firebase Hosting     │
                               │  (CDN / Static Assets)  │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   Firebase Authentication │                 │  Cloud Functions / API    │
       │    (Custom Claims/RBAC)   │                 │   (Node.js / Express)     │
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
         ┌───────────────────┬──────────────┴──────────────┬───────────────────┐
         │                   │                             │                   │
         ▼                   ▼                             ▼                   ▼
┌─────────────────┐ ┌─────────────────┐           ┌─────────────────┐ ┌─────────────────┐
│ Cloud Firestore │ │ Firebase Storage│           │ Razorpay Gateway│ │ WhatsApp/Email  │
│(Rules Protected)│ │ (Prescriptions) │           │ (HMAC Verified) │ │ (Notifications) │
└─────────────────┘ └─────────────────┘           └─────────────────┘ └─────────────────┘
```

---

## 2. Core Subsystems

### A. Health & Clinical Intelligence
- **RAG Retrieval Engine**: Grounded on WHO, AYUSH pharmacopeia, ICMR, and NHS clinical monographs.
- **Safety Triage**: Automatic 112 emergency interceptor for critical cardiovascular and respiratory symptoms.
- **Prescription Verification**: Role-gated review queue before release of Schedule H / prescription medicines.

### B. Monetization & Payments Engine
- **Price Calculation Authority**: Computed exclusively server-side.
- **Razorpay Orders & Webhooks**: HMAC-SHA256 signature verification + Webhook idempotency ledger (`webhookEvents`).
- **Care Subscriptions**: Automated monthly (₹99) and yearly (₹999) recurring entitlements.

### C. VedicMind AI Learning
- **Socratic AI Math Tutor**: Mental math and speed aptitude coach.
- **Deterministic Math Verification Engine (`mathVerifier.js`)**: Non-LLM mathematical solver eliminating calculation hallucinations.
- **Domain Router (`aiRouter.js`)**: Real-time intent classification isolating clinical health inquiries from mathematics.
