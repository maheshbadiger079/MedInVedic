# 💳 MedInVedic Payments & Monetization Infrastructure

## 1. Architecture Flow

```
Customer                Frontend               Cloud Function             Razorpay Gateway
   │                       │                          │                          │
   │── Choose Service ────>│                          │                          │
   │                       │── POST /payments/order ─>│                          │
   │                       │                          │── Calculate Price        │
   │                       │                          │── Create Gateway Order ─>│
   │                       │                          │<─ Return Order ID ───────│
   │                       │<─ Return Razorpay Order ─│                          │
   │                       │                          │                          │
   │<── Razorpay Modal ────│                          │                          │
   │── Complete Payment ──>│                          │                          │
   │                       │── POST /payments/verify >│                          │
   │                       │                          │── Verify HMAC-SHA256     │
   │                       │                          │── Update Firestore: PAID │
   │                       │                          │── Dispatch WhatsApp Notif│
   │                       │<─ Verified OK ───────────│                          │
   │<── Success Confirmation
```

---

## 2. Security Invariants
1. **Zero Client Price Authority**: The frontend never provides the payable amount. Amounts are determined strictly server-side by looking up the product/doctor/plan ID in Firestore.
2. **HMAC-SHA256 Signature Verification**: All checkout callbacks are validated against `RAZORPAY_KEY_SECRET`.
3. **Webhook Idempotency**: All webhook events are logged in `webhookEvents/{eventId}` to prevent duplicate processing.
4. **Refund Workflow**: Controlled via `/api/payments/refund` with strict audit logging.
