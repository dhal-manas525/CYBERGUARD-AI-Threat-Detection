# CYBERGUARD REST API Reference Specification

Base API URL: `http://localhost:8000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Register a new security analyst account.
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@cyberguard.ai",
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { "id": 1, "name": "Alex Mercer", "email": "alex@cyberguard.ai", "role": "analyst" }
  }
  ```

### `POST /api/auth/login`
Authenticate and obtain JWT bearer token.

### `GET /api/auth/me`
Retrieve currently authenticated user session.

---

## 2. Threat Analysis Endpoints

### `POST /api/analyze/url` (Scenario A: URLs)
Analyze suspicious URL using 21-feature ML pipeline and CyberTrust attribution.
- **Request Body**:
  ```json
  {
    "url": "http://onlinesbi-kyc-verification-portal.com/login.php"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "id": 1,
    "target": "http://onlinesbi-kyc-verification-portal.com/login.php",
    "scan_type": "url",
    "risk_score": 94.0,
    "threat_level": "CRITICAL",
    "threat_category": "Phishing & Brand Impersonation",
    "ml_prediction": "MALICIOUS",
    "ml_confidence": 0.99,
    "cybertrust": {
      "claimed_identity": "State Bank of India (SBI)",
      "identity_match_status": "LOOKALIKE_DETECTED",
      "is_impersonation": true,
      "why_flagged": ["Domain contains 'sbi' referencing State Bank of India but registers to unauthorized host"],
      "possible_attack_goal": "Internet banking credentials & transaction OTP",
      "recommended_actions": ["Do NOT enter netbanking password or OTP"]
    }
  }
  ```

### `POST /api/analyze/email` (Scenario A: Emails)
Analyze sender headers, subject line, body text, and embedded redirect links.

### `POST /api/analyze/message` (Scenario A: SMS/Messaging)
Analyze social engineering messages (electricity cutoff, fake jobs, lottery scams).

### `POST /api/analyze/website` (Scenario A: Website Inspector)
Inspects external domain and SSL attributes with strict SSRF loopback protections.

---

## 3. Scenario B: Digital Impersonation & Identity Verification

### `POST /api/analyze/impersonation`
Compares Claimed Organization with Target URL/domain/sender.
- **Request Body**:
  ```json
  {
    "claimed_organization": "Microsoft",
    "target": "http://micr0s0ft-security-auth.net/login",
    "auto_create_incident": true
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "claimed_organization": "Microsoft",
    "target_destination": "http://micr0s0ft-security-auth.net/login",
    "target_host": "micr0s0ft-security-auth.net",
    "official_domains": ["microsoft.com", "office.com"],
    "match_status": "LOOKALIKE_IMPERSONATION",
    "impersonation_detected": true,
    "similarity_score": 0.88,
    "risk_score": 94.0,
    "threat_level": "CRITICAL",
    "threat_category": "Brand Impersonation & Phishing Decoy",
    "homoglyphs_detected": [
      {
        "character": "0",
        "substitutes_for": "o",
        "explanation": "Character '0' visually mimics letter 'o'"
      }
    ],
    "evidentiary_breakdown": [
      "Active homoglyph substitution detected",
      "Deceptive lookalike domain mimics official corporate namespace"
    ],
    "incident_id": "INC-2026-9A4B12"
  }
  ```

---

## 4. Scenario C: Authentication Event Anomaly Detector

### `POST /api/analyze/auth-events`
Evaluates batch authentication event telemetry for brute force, password spraying, and impossible travel.
- **Request Body**:
  ```json
  {
    "events": [
      {
        "timestamp": "2026-10-09T12:00:00Z",
        "username": "cfo@enterprise.org",
        "ip_address": "45.142.214.10",
        "location": "Frankfurt, DE",
        "status": "FAILURE",
        "user_agent": "python-requests/2.28.1"
      },
      {
        "timestamp": "2026-10-09T12:02:00Z",
        "username": "hr_director@enterprise.org",
        "ip_address": "45.142.214.10",
        "location": "Frankfurt, DE",
        "status": "FAILURE",
        "user_agent": "python-requests/2.28.1"
      }
    ],
    "auto_create_incident": true
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "total_events": 2,
    "anomaly_score": 82.0,
    "threat_level": "CRITICAL",
    "threat_category": "Active Coordinated Credential Attack",
    "attack_vectors": ["Horizontal Password Spraying", "Automated Attack Tooling"],
    "affected_accounts": ["cfo@enterprise.org", "hr_director@enterprise.org"],
    "offending_ips": ["45.142.214.10"],
    "summary": "Observed adversary rotating passwords across distinct accounts using python-requests client",
    "incident_id": "INC-2026-F814D2"
  }
  ```

### `GET /api/analyze/auth-events/scenarios`
Returns pre-configured synthetic test scenarios for 1-click execution.

---

## 5. Incident Lifecycle Management

### `GET /api/incidents`
Retrieve tracked incidents with optional filters (`status`, `scenario_type`, `threat_level`).

### `GET /api/incidents/{incident_id}`
Retrieve incident details by ID.

### `PATCH /api/incidents/{incident_id}`
Mutate incident lifecycle state (`New` -> `Investigating` -> `Mitigated` -> `Closed`).
- **Request Body**:
  ```json
  {
    "status": "Mitigated",
    "notes": "Offending IP blackholed on Cloudflare Edge WAF."
  }
  ```

---

## 6. AI Cybersecurity Advisor

### `POST /api/assistant/chat`
Conversational incident advisory powered by Google Gemini with deterministic rule-based grounding fallback.
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "I surrendered my NetBanking OTP on a fake page. What do I do?" }
    ]
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "reply": "### 🛡️ Immediate Incident Response Protocol\n1. Disconnect interaction immediately...",
    "model_used": "gemini-2.5-flash"
  }
  ```

---

## 7. Reports & Exports

### `POST /api/reports/{scan_id}`
Generates executive threat intelligence summary.

### `GET /api/reports/{scan_id}/export?format=json|csv`
Download formal report as JSON document or CSV spreadsheet.
