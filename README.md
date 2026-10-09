# CYBERGUARD
### AI-Powered Cyber Threat, Phishing & Digital Impersonation Detection and Response System

> **Tagline:** *"Don't just detect the threat. Understand who is behind it."*  
> **Signature Innovation:** **CYBERTRUST INTELLIGENCE™**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Automated_Tests-14%2F14_PASS-brightgreen)](backend/tests/run_tests.py)

---

## 1. Project Overview & Hackathon Vision

Traditional cybersecurity scanners and simple URL checkers output an opaque probability score (e.g. *"Phishing — 92%"*). They fail to answer the critical questions required for effective cyber defense:
- **Who is this threat pretending to be?**
- **Does the domain actually match the claimed organization?**
- **What specific evidence caused this risk score?**
- **What is the attacker trying to obtain?**
- **What should the user or SOC analyst do right now?**

**CYBERGUARD** solves this with **CYBERTRUST INTELLIGENCE™**, an explainable cyber-defense platform protecting both the **Technology Layer** (URLs, websites, authentication events, API telemetry) and the **Human Layer** (phishing messages, social engineering, digital impersonation).

---

## 2. Three Demonstrable Scenarios (Official Problem Statement)

### 🛡️ Scenario A: Phishing & Social Engineering Detection
- **URL Threat Scanner (`/scan/url`)**: 21-feature ML pipeline + brand intelligence evaluating lexical structure, typosquatting, and deceptive paths.
- **Email Phishing Analyzer (`/scan/email`)**: Detects sender-domain spoofing, psychological urgency manipulation, and credential harvesting hooks.
- **Messaging Scam Detector (`/scan/message`)**: Identifies SMS and WhatsApp fraud (electricity disconnection hoaxes, fake job offers, investment/Ponzi scams, OTP theft).
- **Website Inspector (`/scan/website`)**: Safe non-intrusive domain & SSL analysis enforced with strict **SSRF guardrails**.

### 🔍 Scenario B: Digital Impersonation & Identity Verification
- **Path (`/scan/impersonation`)**:
- Evaluates **Claimed Organization vs Target Destination**.
- **Homoglyph Engine**: Uncovers visual character deception (`0` $\rightarrow$ `o`, `1` $\rightarrow$ `l`, `3` $\rightarrow$ `e`, `@` $\rightarrow$ `a`, `vv` $\rightarrow$ `w`).
- **Levenshtein Distance & Similarity Metric**: Quantifies string distance against official corporate domains.
- **Subdomain Deception**: Detects attacks where brand keywords are prepended as subdomains on foreign root domains (e.g., `onlinesbi.verify-kyc.org`).
- **Verdict Classification**: `EXACT_MATCH` (Official), `LOOKALIKE_IMPERSONATION` (Critical), `MISMATCH_UNAUTHORIZED` (High Risk).
- **Automatic Incident Escalation**: Escalates critical impersonation decoys directly to SOC tracking.

### ⚡ Scenario C: Authentication Event Anomaly Detector
- **Path (`/scan/auth-anomaly`)**:
- Batch authentication telemetry inspection detecting:
  1. **Brute Force Attacks**: Burst of consecutive credential failures targeting a specific account.
  2. **Horizontal Password Spraying**: Single IP rotating passwords across distinct executive accounts to evade lockout limits.
  3. **Impossible Travel Velocity**: Haversine distance velocity calculation detecting disparate geographic logins (e.g. New York followed by Moscow in 15 minutes, $>900\text{ km/h}$).
  4. **Adversary Tool Signatures**: Flags automated attack tooling (`python-requests`, `Hydra`, `curl`, `sqlmap`).
- **1-Click Presets**: Test suites for instant evaluation without manual typing.

---

## 3. Incident Management & Cybersecurity Advisor

- **Incident Tracking Center (`/incidents`)**:
  - Full lifecycle workflow: `New` $\rightarrow$ `Investigating` $\rightarrow$ `Mitigated` $\rightarrow$ `Closed`.
  - Live status mutations via `PATCH /api/incidents/{id}`.
  - Analyst remediation notes and evidentiary audit logs.
- **AI Cybersecurity Advisor (`/assistant`)**:
  - Conversational advisor powered by **Google Gemini** with strict grounding and deterministic rule-engine fallback.
  - Answers incident triage questions: *"I surrendered my OTP on a fake page. What do I do right now?"*
- **Report Generator & Data Exports (`/reports`)**:
  - Download formal threat reports in **JSON** or **CSV** formats, or print executive PDFs.

---

## 4. Fixed Risk Scoring Thresholds

CYBERGUARD adheres strictly to transparent, non-fabricated scoring:
- `0–30`: **LOW / SAFE** (Verified enterprise namespace, valid TLS, clean baseline)
- `31–60`: **MEDIUM / SUSPICIOUS** (Unverified redirect patterns, low-confidence anomaly)
- `61–80`: **HIGH RISK** (Deceptive subdomain, unauthorized third-party sender mismatch)
- `81–100`: **CRITICAL** (Active brand impersonation, homoglyph typosquat, password spraying)

---

## 5. Quick Start & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

### 3. Pre-Configured Demo Credentials
The SQLite database automatically seeds a demonstration analyst account:
- **Email:** `analyst@cyberguard.ai`
- **Password:** `CyberGuard@2026!`
- *(Or register an analyst account at `/signup`.)*

---

## 6. Automated Test Suite (100% Pass)

Run the comprehensive unit and integration test suite:
```bash
cd backend
python tests/run_tests.py
```
```
..............
Ran 14 tests in 0.705s
OK
```

All 14 test cases pass:
- Benign URL classification (`SAFE`)
- Banking lookalike phishing (`CRITICAL`)
- Email credential demand & urgency detection
- SMS fake electricity cutoff scam detection
- Scenario B: Exact match verification
- Scenario B: Homoglyph deception detection (`micr0s0ft` $\rightarrow$ `0`)
- Scenario B: HTTP API with auto-incident escalation
- Scenario C: Brute force attack detection
- Scenario C: Horizontal password spraying detection
- Scenario C: Impossible travel geo-velocity detection ($>900\text{ km/h}$)
- Scenario C: HTTP API with auto-incident escalation
- Incident management lifecycle (`New` $\rightarrow$ `Investigating` $\rightarrow$ `Mitigated` $\rightarrow$ `Closed`)
- SSRF loopback, RFC 1918, and cloud metadata protections
- Gemini conversational assistant with deterministic grounding fallback

---

## 7. Documentation Index

- [Live Demonstration Guide for Evaluators](docs/DEMO_GUIDE.md) — 5-minute step-by-step walkthrough.
- [Technical Architecture & ML Specification](docs/ARCHITECTURE.md) — 21 features, NumPy model, SSRF protections.
- [REST API Reference](docs/API_REFERENCE.md) — Full endpoint schemas and examples.
