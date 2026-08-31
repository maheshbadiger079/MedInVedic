# 🚀 MedInVedic Production Deployment Guide

## 1. Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Authorized Firebase project (`medinvedic`)

## 2. Deployment Steps

### A. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

### B. Deploy Cloud Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### C. Sync Capacitor & Deploy Web Frontend
```bash
npx cap sync
firebase deploy --only hosting
```

---

## 3. Rollback Protocol
In the event of an unexpected runtime failure:
1. Revert to the previous Git commit checkpoint:
   ```bash
   git log -n 5
   git checkout <PREVIOUS_STABLE_COMMIT_HASH>
   ```
2. Redeploy hosting and rules:
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```
