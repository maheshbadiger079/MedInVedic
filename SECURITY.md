# 🔐 MedInVedic Security & Privacy Architecture

## 1. Access Control (RBAC)
- **Roles**: `customer`, `doctor`, `pharmacist`, `clinic`, `lab`, `admin`, `superadmin`.
- **Admin Gating**: Only whitelisted administrators can perform administrative tasks or review prescriptions.
- **Client Privilege Prevention**: Clients cannot update role, membership tier, or payment statuses directly in Firestore.

## 2. Secrets Management
- All sensitive tokens (Razorpay Keys, Webhook Secrets, JWT Signing Keys, Gemini/OpenAI API Keys, WhatsApp tokens) are stored in server environment configuration.
- Zero secrets committed to version control.

## 3. Healthcare Privacy & Storage
- Prescriptions are isolated under `/prescriptions/{userId}/` in Firebase Storage.
- Download access requires authentication and is restricted to the owning patient, licensed pharmacists, and attending doctors.
