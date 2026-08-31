# 🌿 MedInVedic — Where Modern Medicine Meets Ancient Ayurveda

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Functions%20%7C%20Firestore-orange)](https://firebase.google.com)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20Verified-blue)](https://razorpay.com)
[![VedicMind AI](https://img.shields.io/badge/VedicMind-AI%20Mathematics-emerald)](https://medinvedic.web.app/pages/vedicmind.html)

**MedInVedic** is India's first integrative healthcare & wellness platform uniting evidence-based modern pharmacology with classical Ayurvedic wisdom and intelligent AI diagnostics.

Live Web Application: **[https://medinvedic.web.app](https://medinvedic.web.app)**

---

## 🌟 Key Features

### 1. 🏥 Modern Medicine & Online Pharmacy
- Certified OTC & Prescription medicine ordering with automated prescription verification.
- Integrated directory of licensed local pharmacies with real-time stock indicators.
- Automatic prescription checks before dispensing regulated medications.

### 2. 🌿 Natural Healing & Wellness Sanctuary
- Prakriti analysis (Vata, Pitta, Kapha) and classical Ayurvedic formulations (Ashwagandha, Triphala, Chyawanprash, Brahmi).
- AI Diet Planner, Dosha Imbalance Tracker, and Herbal Formulation Engine.
- Clinical safety grounding ("NO SOURCE → NO CLAIM" policy).

### 3. 👨‍⚕️ Doctor Consultations & Telehealth
- Verified doctor discovery across Modern Medicine, Ayurveda, Homeopathy, and Panchakarma.
- Video/Audio consultation booking with instant calendar scheduling and Razorpay checkout.

### 4. 🧠 VedicMind AI Learning Platform
- Dedicated speed aptitude and mental mathematics suite.
- 16 Vedic Sutras interactive calculators, Socratic AI Math Tutor, Handwriting Whiteboard, and Speed Battle Arena.
- 100% Deterministic Mathematical Verification Engine (zero AI hallucination in calculations).

### 5. 💳 Real Razorpay Payment & Wallet System
- Server-side price calculation authority (client-side tampering is prevented).
- HMAC-SHA256 signature verification and webhook idempotency ledger (`webhookEvents`).
- Wallet top-up, transaction ledger, and instant GST invoices.

### 6. 🛡️ Admin Revenue & Control Center
- Live GMV and Platform Net Revenue metrics (targeting ₹1,00,000+/month).
- Doctor verification portal, prescription review queue, audit logs, and lead tracking.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Firebase CLI (`npm install -g firebase-tools`)

### Local Setup
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/maheshbadiger/medinvedic.git
   cd medinvedic
   npm install
   cd functions && npm install && cd ..
   ```
2. Configure Environment:
   ```bash
   cp .env.example .env
   ```
3. Run Local Server:
   ```bash
   npm run dev
   # Server: http://localhost:3001
   # Frontend: http://localhost:8888 or via Firebase Emulator
   ```

---

## 🔒 Security & Privacy
- **Zero Exposed Secrets**: All Razorpay keys, JWT secrets, and AI API keys reside in server configuration.
- **Strict Domain Isolation**: Logical separation prevents clinical AI and mathematical educational content from colliding.
- **Healthcare Privacy**: Sensitive prescription files are strictly gated via Firestore and Firebase Storage RBAC rules.

---

## 📄 License
MedInVedic is licensed under the MIT License. Developed with pride by Mahesh Badiger in Pune, India.
