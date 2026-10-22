# MedInVedic AI Simulation Lab — Security & Healthcare Privacy Checklist

**Auditors:** Healthcare Software Safety Engineer & Information Security Officer  
**Compliance Standards:** Digital Information Security in Healthcare Act (DISHA), Digital Personal Data Protection Act 2023 (DPDP India), HIPAA Privacy Rule Alignment  
**Module:** `MedInVedic → AI Intelligence → Simulation Lab`  

---

## 1. Healthcare Privacy & Protected Health Information (PHI)

- [x] **Zero Real PHI in LLM Context**:
  The simulator operates exclusively on synthetic patient personas (`is_synthetic: true`, `data_provenance: 'FICTIONAL_SIMULATION_DATA_ONLY'`). Real user medical records, prescriptions, and lab tests are NEVER uploaded to simulation models without explicit consent.
- [x] **Explicit Synthetic Data Watermarking**:
  Every generated scenario persona is prepended with a distinct synthetic identifier (`SYNTH-...`) to prevent accidental confusion with real electronic health records.
- [x] **Multi-Tenant Ownership Isolation**:
  Firestore security rules enforce that only the authenticated creator of a simulation job (`request.auth.uid == resource.data.ownerId`) can read, update, or delete simulation records.
- [x] **Time-Limited Retention & Auto-Purge**:
  Simulation events and dialogue transcripts are eligible for automated purging after 30 days. Users can delete individual simulations and associated event streams on demand.
- [x] **Explicit Doctor Sharing Barrier**:
  Reports and doctor discussion questions are never automatically transmitted to registered healthcare providers. Sharing requires explicit manual export and user authorization.

---

## 2. Prompt Injection & AI Safety Defenses

- [x] **Pre-Execution Input Screening**:
  All user inputs (scenario title, goals, lifestyle, medical context) pass through heuristic and RegEx safety triage before any agent generation or LLM invocation.
- [x] **Injection Pattern Rejection**:
  Strict blocking of delimiter escapes, role-break attempts, jailbreak prompts (`DAN mode`, `ignore previous instructions`, `pretend to be a real doctor`).
- [x] **Emergency Escalation Interception**:
  Immediate interception of acute red-flag keywords (`chest pain`, `stroke`, `severe breathlessness`, `anaphylaxis`, `vomiting blood`, `suicide`). Execution is halted and the user is directed to call National Emergency 112 or Ambulance 108.
- [x] **Prescription Tampering Block**:
  The simulator actively blocks queries attempting to stop, discontinue, or alter prescribed pharmaceuticals (`Stop taking insulin/metformin/amlodipine`).

---

## 3. Evidence Grounding & Non-Fabrication

- [x] **Authoritative Knowledge Graph Grounding**:
  All medical relationships (indications, interactions, dosages, contraindications) are anchored in verified sources: ICMR, CDSCO, WHO, Ministry of AYUSH, Charaka Samhita, and peer-reviewed clinical trials.
- [x] **Provenance Preservation**:
  Every edge in the knowledge graph maintains explicit citations and evidence quality tiers (e.g. *GRADE A*, *National Guideline*, *Classical AYUSH Canon*).
- [x] **Separation of Traditional Use from Clinical Trials**:
  Classical Ayurvedic indications are explicitly distinguished from modern randomized controlled trials. Traditional use is never conflated with statutory pharmacological proof.
- [x] **Consensus Caveat**:
  Virtual agent consensus is explicitly labeled as simulated multi-disciplinary discourse, NOT real-world medical consensus or proof of therapeutic efficacy.

---

## 4. Infrastructure & Secret Management

- [x] **Zero Browser Secrets**:
  No API keys (Gemini, OpenAI, Zep) are exposed in client-side code (`public/`). All credentials reside in server configuration and environment variables.
- [x] **Least-Privilege Firestore Rules**:
  Rules in `firestore.rules` restrict creation, read, and write permissions strictly to resource owners and verified administrators.
- [x] **Container Hardening (Cloud Run)**:
  `simulation_service/Dockerfile` runs as an unprivileged non-root user (`medinvedic`), uses multi-stage builds, and exposes only port 8080.
- [x] **Rate Limiting & Cost Ceilings**:
  Simulation jobs are bounded by strict maximum rounds (cap 6), token ceilings (4,000 tokens), and execution timeouts (45 seconds).
