# 🛡️ MedInVedic — Cloudflare Free + Firebase Zero-Downtime Deployment Guide

> **Authoritative Handbook for Production Deployment & DevSecOps**  
> **Target Cost:** ₹0 (Strictly Cloudflare Free Plan)  
> **Downtime Tolerance:** Zero Downtime  
> **Primary Rule:** Inspect → Backup → Prepare → Verify → Configure → Test → Switch DNS → Monitor → Rollback if necessary.

---

## 1. Executive Summary & Target Architecture

MedInVedic's production web application is hosted on Firebase (https://medinvedic.web.app). Adding Cloudflare Free as the front-line edge proxy brings global DDoS defense, edge caching of public assets, TLS termination, and basic bot protection—without increasing hosting costs or interrupting live patient workflows.

`
══════════════════════════════════════════════════════════════════════════
                            TARGET ARCHITECTURE
══════════════════════════════════════════════════════════════════════════

                                User Browser / App
                                        │
                                        ▼
                           Cloudflare Authoritative DNS
                                        │
                                        ▼
                         Cloudflare Free Edge (₹0 / month)
                       ┌─────────────────────────────────┐
                       │ • Strict TLS 1.3 / Force HTTPS  │
                       │ • L3/L4/L7 DDoS Protection      │
                       │ • Free Bot Fight Mode           │
                       │ • Canonical Redirect (www→root) │
                       │ • Public Assets Edge Cache      │
                       │ • Dynamic / API Cache Bypass    │
                       └────────────────┬────────────────┘
                                        │ (Encrypted Origin Fetch)
                                        ▼
                             Firebase Hosting Origin
                     (medinvedic.web.app / custom domain cert)
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
Firebase Authentication         Cloud Functions API            Firebase Storage
(medinvedic.firebaseapp.com)    (/api/** Express Router)     (Patient Prescriptions)
        │                               │                               │
        └───────────────────────┬───────┴───────────────────────────────┘
                                ▼
                         Cloud Firestore
                     (Granular RBAC Security)
`

---

## 2. Absolute Cost Guardrail (₹0 Budget)

To maintain a lifetime cost of **₹0**, only Cloudflare Free capabilities are used. All paid features are prohibited:

- ❌ **PAID FEATURE — SKIPPED**: Cloudflare Pro (/mo), Business (/mo), Enterprise
- ❌ **PAID FEATURE — SKIPPED**: Paid Cloudflare Workers / Workers KV (Firebase Functions serves the backend)
- ❌ **PAID FEATURE — SKIPPED**: Paid Advanced Bot Management (Machine Learning anomaly detection)
- ❌ **PAID FEATURE — SKIPPED**: Paid WAF Managed Rule Sets (OWASP ModSecurity Core Rule Set)
- ❌ **PAID FEATURE — SKIPPED**: Paid Advanced Rate Limiting
- ❌ **PAID FEATURE — SKIPPED**: Cloudflare Images / Stream / Waiting Room paid add-ons

**Enabled Free Capabilities:**
- ✅ Unlimited unmetered DDoS mitigation
- ✅ Global Anycast CDN
- ✅ Free Universal SSL Certificate
- ✅ Basic Bot Fight Mode
- ✅ Up to 5 Custom WAF / Firewall Rules
- ✅ Free Page Rules & Cache Rules (3 free page rules)
- ✅ Free DNS Management with DNSSEC

---

## 3. Important Domain Prerequisite

Cloudflare requires authoritative delegation of an entire second-level domain (e.g., medinvedic.com, medinvedic.org, medinvedic.in).  
Cloudflare **cannot** be put directly in front of *.web.app or *.firebaseapp.com because Google owns those domains.

1. **If you have a custom domain (e.g. medinvedic.com):**  
   Follow this guide step-by-step to bind medinvedic.com to Firebase, then delegate DNS to Cloudflare.
2. **If you do NOT have a custom domain yet:**  
   Do not purchase one automatically. https://medinvedic.web.app remains fully operational. Keep this guide as the exact cutover blueprint for when your domain is procured.

---

## 4. Phase 1 — Migration Checkpoint & Backups (Completed)

Before touching DNS or registrar configurations, the environment was snapshotted:

1. **Git Migration Tag:**
   MEDINVEDIC-CLOUDFLARE-MIGRATION-BEFORE-DNS
2. **Physical Configuration Backup:**
   Stored safely in .backup/migration-checkpoint-cloudflare/:
   - irebase.json
   - irestore.rules
   - storage.rules
   - .firebaserc
   - public/js/firebase-config.js

---

## 5. Phase 2 — Firebase Custom Domain Binding

Before pointing Cloudflare to Firebase, Firebase Hosting must recognize and provision SSL for the custom domain.

1. Open Firebase Console (Hosting -> Add custom domain).
2. Enter your domain: medinvedic.com.
3. Check **Redirect www.medinvedic.com to medinvedic.com**.
4. Retrieve the **Domain Ownership Verification** TXT record:
   - **Type:** TXT
   - **Host / Name:** @
   - **Value:** google-site-verification=...
5. Note down the **A Records** (or CNAME) provided by Firebase for hosting.

---

## 6. Phase 3 & 4 — Cloudflare Setup & DNS Safety Check

### DNS Record Safety Comparison
| Record Type | Name / Host | Target / Value | Cloudflare Proxy Status | Purpose & Critical Safety Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | @ (root) | <Firebase IP 1> | ☁️ **Proxied (Orange Cloud)** | Web traffic routed through Cloudflare edge to Firebase |
| **A** | @ (root) | <Firebase IP 2> | ☁️ **Proxied (Orange Cloud)** | Firebase secondary Anycast IP |
| **CNAME** | www | medinvedic.com | ☁️ **Proxied (Orange Cloud)** | Canonical redirect to root domain |
| **TXT** | @ | google-site-verification=... | ⚙️ **DNS-Only (Grey Cloud)** | Firebase domain ownership verification |
| **MX** | @ | <Your Mail Server> | ⚙️ **DNS-Only (Grey Cloud)** | ⚠️ **NEVER PROXY MX RECORDS (Breaks Email)** |
| **TXT** | @ | =spf1 include:... ~all | ⚙️ **DNS-Only (Grey Cloud)** | SPF Email Deliverability Authentication |
| **TXT / CNAME**| *._domainkey| <DKIM Key / Selector> | ⚙️ **DNS-Only (Grey Cloud)** | DKIM Email Signature Authentication |
| **TXT** | _dmarc | =DMARC1; p=quarantine;... | ⚙️ **DNS-Only (Grey Cloud)** | DMARC Phishing Protection |

---

## 7. Phase 5 — SSL/TLS & Edge Routing Configuration

In Cloudflare Dashboard:
1. **SSL/TLS Encryption Mode:** **Full (Strict)**.
2. **Edge Certificates:**
   - **Always Use HTTPS**: Enabled
   - **Minimum TLS Version**: TLS 1.2 / TLS 1.3
   - **Automatic HTTPS Rewrites**: Enabled
3. **Canonical Domain Redirection (No Redirect Loops):**
   - Redirect www.medinvedic.com -> https://medinvedic.com via Cloudflare Redirect Rules (single 301 hop).

---

## 8. Phase 6 — Free Security & WAF Configuration

- **Clearly Malicious** -> BLOCK
- **Suspicious** -> MANAGED CHALLENGE
- **Normal Visitors / Search Engines / Mobile App** -> ALLOW

1. **Bot Fight Mode**: Enable (Free). Automatically whitelists verified search engine bots.
2. **Custom WAF Rules (Free Tier: 5 Rules Max)**:
   - Block exploit patterns (/.env, /.git, /wp-login.php, /etc/passwd).
   - Managed challenge for suspicious threat scores (cf.threat_score gt 30).
   - Never block legitimate user-agents, mobile apps, or Razorpay webhook callbacks (/api/payment/webhook).

---

## 9. Phase 7 — Healthcare Privacy & Caching Architecture

| Resource Category | Cloudflare Edge | Cache-Control |
| :--- | :--- | :--- |
| JS Bundles (/js/*.js) | CACHE (7 days) | max-age=31536000 |
| CSS Stylesheets (/css/*.css) | CACHE (7 days) | max-age=31536000 |
| Static Images & Icons | CACHE (7 days) | max-age=86400 |
| HTML Pages (*.html, /) | BYPASS CACHE | no-cache, no-store |
| API Endpoints (/api/**) | BYPASS CACHE | no-store, private |
| Prescriptions & Health Docs | BYPASS CACHE | private, no-cache |
| User Profile & Auth Tokens | BYPASS CACHE | private, no-store |
| AI Consultation & VedicMind | BYPASS CACHE | private, no-store |

---

## 10. Phase 8 — Firebase Integration Compatibility Checklist

- **Firebase Auth**: In Firebase Console -> Authentication -> Settings -> Authorized Domains, add medinvedic.com.
- **Cloud Firestore**: Rules version 2 remain active.
- **Firebase Storage**: Prescriptions restricted to owning patient and licensed medical staff via storage.rules.
- **Razorpay Checkout**: Webhooks and payment endpoints operate via un-cached Cloud Functions.
- **Google Analytics 4**: Measurement ID G-RW9JCDWBQ7 sends directly to Google Analytics endpoints.

---

## 11. Phase 9 — Zero-Downtime DNS Cutover Sequence

1. Keep old DNS records active in existing registrar.
2. Update registrar nameservers to Cloudflare's assigned nameservers.
3. Propagation window (5m - 24h): During propagation, old DNS hits Firebase directly; new DNS hits Cloudflare -> Firebase. Zero downtime is maintained.

---

## 12. Phase 10 — Production Monitoring & Error Diagnosis

- **HTTP 200 / 304**: Normal.
- **Error 520 / 521 / 522**: Cloudflare cannot reach Firebase IPs -> verify Cloudflare A records.
- **Error 525 / 526**: SSL Handshake failed -> toggle Cloudflare SSL mode to Full or temporarily switch proxy to DNS-Only.
- **Error 403**: False positive in Bot Fight Mode -> inspect Cloudflare Security Events.

---

## 13. Phase 11 — 5-Level Rollback Protocol

- **Level 1**: Disable problematic Cloudflare WAF / Bot Fight Mode rule.
- **Level 2**: Purge Cloudflare Cache ("Purge Everything").
- **Level 3**: Toggle Cloudflare Proxy from Orange Cloud to Grey Cloud (DNS-Only).
- **Level 4**: Revert registrar nameservers back to original domain registrar.
- **Level 5**: Fallback directly to https://medinvedic.web.app.
