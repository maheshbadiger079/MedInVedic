# MedInVedic AI Simulation Lab — Deployment & Operations Guide

**System Architect:** Principal Full-Stack Engineer & Healthcare Software Safety Engineer  
**Feature Branch:** `feature/mirofish-ai-simulation-lab`  
**Hosting Environment:** Firebase (Hosting, Cloud Functions, Firestore) + Managed Cloud Run  
**Security Proxy:** Cloudflare  

---

## 1. Architecture Overview

The MedInVedic AI Simulation Lab employs a dual-deployment pattern:
1. **Frontend & Gateway Layer (Firebase)**:
   - Static assets & single-page application served via Firebase Hosting (`public/pages/simulation-lab.html`, `public/js/simulation-lab.js`, `public/css/simulation-lab.css`).
   - Serverless API gateway served via Firebase Cloud Functions Node.js 20 runtime (`functions/simulation/simulation-router.js`).
   - Least-privilege data persistence via Google Cloud Firestore (`firestore.rules`, `firestore.indexes.json`).
2. **Dedicated Simulation Engine Layer (Cloud Run)**:
   - Independent, containerized Python 3.11+ / FastAPI microservice (`simulation_service/`) for long-running or compute-heavy multi-agent simulations.
   - 100% Permissive Open-Source clean-room architecture (zero AGPL code).

---

## 2. Production Safety Gate: Feature Flag

The Simulation Lab is strictly gated behind a feature flag:
```env
ENABLE_AI_SIMULATION_LAB=false
```
**Production Rule:** Keep this flag `false` until all clinical safety, privacy, and open-source license reviews have officially passed.

To enable in local or staging environments:
```env
ENABLE_AI_SIMULATION_LAB=true
```

---

## 3. Deployment Procedure

### 3.1 Step 1: Pre-Flight Verification
Run all automated test suites to ensure zero regressions:
```bash
# 1. Run Simulation Lab test suite (63 tests)
node tests/simulation_lab_test.js

# 2. Run existing platform test suites
node tests/workspace_feature_test.js
node tests/health_hub_comprehensive_test.js
node tests/vedicmind_test.js
```
*All test suites must report 100% pass before proceeding.*

### 3.2 Step 2: Deploy Firebase Cloud Functions & Hosting
Deploy the updated Firebase hosting rules, Firestore rules, and functions:
```bash
# Deploy Firestore security rules and compound indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Firebase Cloud Functions (incorporating simulation routes)
firebase deploy --only functions

# Deploy Firebase Hosting frontend (incorporating simulation-lab.html and assets)
firebase deploy --only hosting
```

### 3.3 Step 3: Deploy Cloud Run Simulation Microservice (Optional Dedicated Runner)
```bash
cd simulation_service

# Build container via Google Cloud Build
gcloud builds submit --tag gcr.io/medinvedic/simulation-engine:1.0.0

# Deploy container to Cloud Run
gcloud run deploy medinvedic-simulation-engine \
  --image gcr.io/medinvedic/simulation-engine:1.0.0 \
  --platform managed \
  --region asia-south1 \
  --no-allow-unauthenticated \
  --min-instances 0 \
  --max-instances 5 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars ENABLE_AI_SIMULATION_LAB=true
```

---

## 4. Verification & Health Probes

1. **Frontend Access**:
   Navigate to `https://medinvedic.web.app/pages/simulation-lab.html` or `https://medinvedic.web.app/simulation-lab`.
   Verify that the 11 panels render properly and that the educational disclaimer banner is prominent.
2. **API Health Probe**:
   ```bash
   curl -s https://medinvedic.web.app/api/simulations/knowledge-graph | jq .stats
   ```
   *Expected response:* Total nodes >= 12, total edges >= 13, `compliance_status: "EVIDENCE_PROVENANCE_VERIFIED"`.
3. **Emergency Escalation Verification**:
   Submit a test scenario containing `"chest pain"`.
   Verify HTTP 400 rejection with `errorCode: "EMERGENCY_DETECTED"` and emergency helpline guidance (112/108).

---

## 5. Rollback Procedure

If any unexpected regression occurs:
1. **Instant Circuit-Breaker (No re-deployment needed)**:
   In Firebase Cloud Functions environment or Secret Manager, set:
   ```bash
   firebase functions:config:set simulation.enabled="false"
   ```
2. **Hosting Rollback**:
   Revert to previous Firebase Hosting release directly in Firebase Console:
   - Go to Firebase Console → Hosting → Release History → Click **Roll back** on prior release.
3. **Git Branch Reset**:
   ```bash
   git checkout main
   git pull origin main
   firebase deploy --only hosting,functions
   ```
