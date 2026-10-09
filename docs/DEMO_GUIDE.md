# CYBERGUARD — Hackathon Live Demonstration Guide
> **"Don't just detect the threat. Understand who is behind it."**

This guide provides a structured, 5-minute technical presentation script for hackathon mentors, judges, and evaluators.

---

## 🌟 Executive Summary

Traditional URL scanners output an opaque risk percentage (e.g. *"Phishing — 92%"*).
**CYBERGUARD** solves this with **CYBERTRUST INTELLIGENCE™**:
1. **Deconstructed Attribution**: Identifies exactly who the threat is impersonating (e.g. State Bank of India, PayPal, Microsoft).
2. **Domain Canonical Verification**: Compares observed infrastructure against official corporate namespaces.
3. **Homoglyph & Typosquatting Analysis**: Discovers character replacements (e.g., `0` for `o`, `1` for `l`) and deceptive subdomains.
4. **Adversary Intent Classification**: Clarifies what the attacker wants (NetBanking credentials, session tokens, OTPs).
5. **Calibrated Actionable Mitigations**: Prioritized SOC playbooks and containment workflows.

---

## 🚀 Live Demo Walkthrough (5-Minute Script)

### Step 1: SOC Command Center & 3D Interactive Core (0:00 - 1:00)
- **URL**: `http://localhost:5173/` or `http://localhost:5173/dashboard`
- **Show**:
  - The dark futuristic command center with real-time SOC metric gauges.
  - The Three.js WebGL security core reacting to threat severity states (`SAFE`, `SUSPICIOUS`, `HIGH RISK`, `CRITICAL`).
  - Emphasize: *CYBERGUARD adheres to transparent scoring:*
    - `0–30`: LOW (SAFE)
    - `31–60`: MEDIUM (SUSPICIOUS)
    - `61–80`: HIGH RISK
    - `81–100`: CRITICAL

---

### Step 2: Scenario A — Phishing & Social Engineering (1:00 - 2:00)
- **Navigation**: Click **URL Threat Scanner** (`/scan/url`) or **Email Phishing** (`/scan/email`).
- **Demo URL Target**: Click the Quick Pill for `http://onlinesbi-kyc-verification-portal.com/login.php`.
- **Click**: **Scan Threat**.
- **What Evaluators See**:
  - **Verdict**: `CRITICAL` (Risk Score: 94/100).
  - **Attribution**: Target is mimicking **State Bank of India (SBI)**.
  - **Official Domain vs Obsrvation**: Official domain is `onlinesbi.sbi` / `sbi.co.in`, but target is registered to an unauthorized domain.
  - **Attack Goal**: Harvesting Internet Banking customer credentials and SMS OTPs.
  - **Truthful Threat Feeds**: Honest indicator showing VirusTotal/URLhaus status without fabricated results.

---

### Step 3: Scenario B — Digital Impersonation & Homoglyphs (2:00 - 3:00)
- **Navigation**: Click **Digital Impersonation** (`/scan/impersonation`).
- **Demo 1 — Homoglyph Attack**:
  - Click Quick Pill: **Microsoft Homoglyph (micr0s0ft)** (`http://micr0s0ft-security-auth.net/login`).
  - Click **Execute CyberTrust Verification**.
  - **Show**: The **Homoglyphs & Character Deception** card highlights:
    `'0' → mimics 'o' (Visual homoglyph substitution)`.
  - **Similarity Score**: Calculated edit distance and string similarity ratio.
  - **Verdict**: `LOOKALIKE_IMPERSONATION` (Risk: 94/100, CRITICAL).
  - **Escalation**: Note the badge `ESCALATED: INC-2026-XXXX`.
- **Demo 2 — Legitimate Entity**:
  - Click Quick Pill: **Legitimate PayPal Portal** (`https://www.paypal.com/signin`).
  - **Verdict**: `EXACT_MATCH` (Risk: 5/100, SAFE).

---

### Step 4: Scenario C — Authentication-Event Anomaly Detector (3:00 - 4:00)
- **Navigation**: Click **Auth Anomaly Detector** (`/scan/auth-anomaly`).
- **Demo 1 — Horizontal Password Spraying**:
  - Click 1-Click Pill: **Password Spraying Attack**.
  - Click **Inspect Auth Events**.
  - **What Evaluators See**:
    - Anomaly Score: `100/100` (CRITICAL).
    - Detected Anomaly: *Horizontal Password Spraying Originating from IP 45.142.214.10*.
    - Adversary tested credentials against multiple distinct executive accounts (`cfo@enterprise.org`, `hr_director@enterprise.org`, `devops_lead@enterprise.org`).
    - Tool Identifier: `python-requests/2.28.1` automated attack tooling flagged.
- **Demo 2 — Impossible Travel / Geo-Hopping**:
  - Click 1-Click Pill: **Impossible Travel**.
  - **Show**: Great-circle Haversine velocity calculation (>900 km/h) detecting New York followed by Moscow 15 minutes later.

---

### Step 5: Incident Management & AI Cybersecurity Advisor (4:00 - 5:00)
- **Navigation**: Click **Incident Response** (`/incidents`).
  - **Show**: The active incident queue filtered by status (`New`, `Investigating`, `Mitigated`, `Closed`).
  - Click any incident: show the modal with audit notes.
  - Click **Mitigated**: watch the state update in real-time via `PATCH /api/incidents/{id}`!
  - Add an analyst remediation note (e.g. *"Perimeter IP blocked on AWS WAF"*).
- **Navigation**: Click **AI Cyber Advisor** (`/assistant`).
  - Ask: *"I accidentally clicked an SBI link and entered my OTP. What do I do right now?"*
  - **Show**: Instant prioritized incident response checklist (Disconnect, freeze netbanking, contact bank fraud hotline, rotate credentials) powered by Google Gemini with grounded deterministic fallback.

---

## 🛠️ Verification Commands for Evaluators

### 1. Run Automated Test Suite (14 Tests, 100% Pass)
```bash
cd backend
python tests/run_tests.py
```

### 2. Verify Backend API Health
```bash
curl http://127.0.0.1:8000/api/health
```

### 3. Verify Frontend Production Build
```bash
cd frontend
npm run build
```
