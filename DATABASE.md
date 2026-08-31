# 🗄️ MedInVedic Database Schema & Data Models

## 1. Primary Firestore Collections

### `users/{userId}`
```json
{
  "name": "Mahesh Badiger",
  "email": "maheshbadiger079@gmail.com",
  "phone": "+91 97664 41863",
  "role": "admin",
  "membership": "CARE_YEARLY",
  "created_at": "2026-08-31T00:00:00.000Z",
  "updated_at": "2026-08-31T00:00:00.000Z"
}
```

### `doctors/{doctorId}`
```json
{
  "name": "Dr. Priya Sharma",
  "specialization": "BAMS, MD (Ayurveda)",
  "registrationNumber": "AY-MH-2014-9921",
  "consultationFee": 400,
  "platformFee": 50,
  "city": "Pune",
  "available": true,
  "verified": true,
  "active": true
}
```

### `orders/{orderId}`
```json
{
  "orderNumber": "ORD-1725100000",
  "userId": "usr_123",
  "items": [
    { "productId": "m1", "name": "Paracetamol 500mg", "quantity": 2, "price": 38 }
  ],
  "subtotal": 76,
  "deliveryFee": 40,
  "platformFee": 10,
  "discount": 0,
  "total": 126,
  "currency": "INR",
  "partnerId": "pharm_wellness_pune",
  "paymentStatus": "PAID",
  "orderStatus": "PROCESSING",
  "razorpayOrderId": "order_NXK1829102",
  "razorpayPaymentId": "pay_NXK1829103"
}
```

### `payments/{paymentId}`
```json
{
  "userId": "usr_123",
  "razorpayOrderId": "order_NXK1829102",
  "razorpayPaymentId": "pay_NXK1829103",
  "amount": 126,
  "currency": "INR",
  "purpose": "PHARMACY_ORDER",
  "status": "CAPTURED",
  "paidAt": "2026-08-31T00:00:00.000Z"
}
```
