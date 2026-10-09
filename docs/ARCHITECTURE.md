# CYBERGUARD System Architecture & Technical Specification

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                            CYBERGUARD FRONTEND (Vite + React)                     |
|  - Three.js WebGL Security Core (Reactive to threat scores: SAFE -> CRITICAL)     |
|  - Scenario A: URL / Email / SMS Scanners                                         |
|  - Scenario B: Digital Impersonation & Homoglyph Analyzer                         |
|  - Scenario C: Authentication Event Anomaly Detector                              |
|  - Incident Tracking & Lifecycle Response (New -> Mitigated -> Closed)           |
|  - AI Cybersecurity Advisor (Conversational Assistant)                            |
+-----------------------------------------------------------------------------------+
                                        | (REST API / JSON)
                                        v
+-----------------------------------------------------------------------------------+
|                            FASTAPI OPERATIONAL BACKEND                            |
|                                                                                   |
|  [/api/auth]         [/api/analyze]      [/api/incidents]     [/api/assistant]   |
|   - JWT Auth          - URL / Email       - Lifecycle Patch    - Grounded Gemini  |
|   - Bcrypt Hash       - Impersonation     - Status Workflow    - Deterministic FB |
|                       - Auth Telemetry                                            |
|                                                                                   |
|  [Security Safeguards]                                                            |
|   - SSRF Protection (is_ssrf_safe_host blocks loopback, RFC1918, cloud metadata)  |
|   - Strict Grounding (Never fabricates threat-intel or domain ownership)          |
+-----------------------------------------------------------------------------------+
        |                          |                              |
        v                          v                              v
+------------------+    +----------------------+       +----------------------+
|  CYBERTRUST™     |    |   ML INFERENCE       |       |  DATABASE & ORM      |
|  ENGINE          |    |   ENGINE             |       |                      |
|                  |    |                      |       |  SQLAlchemy Models:  |
| - 40+ Brands DB  |    | - 21 Lexical Features|       |  - User              |
| - Homoglyphs Map |    | - Pure NumPy Softmax |       |  - Scan              |
| - Levenshtein    |    |   Logistic Regressor |       |  - Brand             |
| - Subdomain traps|    | - Zero C-DLL blocks  |       |  - Incident          |
| - Attack goals   |    | - <1ms inference     |       | (SQLite / Postgres)  |
+------------------+    +----------------------+       +----------------------+
```

---

## 2. Machine Learning Architecture & 21-Feature Pipeline

### Feature Extractor (`ml/features/extractor.py`)
Extracts 21 distinct structural, statistical, and lexical features from target URLs:
1. `url_length`: Overall character count
2. `domain_length`: Hostname length
3. `path_length`: Resource path length
4. `subdomain_count`: Number of dots in subdomain
5. `hyphen_count`: Common indicator in typosquatting (`-login`, `-verify`)
6. `at_symbol_count`: RFC credential diversion character `@`
7. `tilde_count`: Hidden user directories
8. `percent_count`: URL hex encoding density
9. `is_ip_address`: Direct IP host targeting (e.g., `185.220.101.5`)
10. `is_https`: Transport layer security flag
11. `has_suspicious_tld`: Checks high-abuse TLDs (`.top`, `.xyz`, `.icu`, `.buzz`, `.fit`)
12. `digit_ratio`: Ratio of digits to total hostname length
13. `special_char_ratio`: Density of punctuation and symbols
14. `entropy`: Shannon entropy measuring random algorithmically generated strings (DGA)
15. `auth_keyword_count`: Frequency of `login`, `signin`, `verify`, `kyc`, `auth`
16. `has_punycode`: Detects internationalized domain name (IDN) homoglyph spoofing (`xn--`)
17. `redirect_count`: Redirection markers in query string
18. `has_port_in_host`: Non-standard HTTP ports in target
19. `is_shortened`: Known URL shortener services (`bit.ly`, `tinyurl`, etc.)
20. `double_slash_in_path`: Truncation bypass tactic `//`
21. `dash_in_domain`: Hyphen count strictly within the second-level domain

### Pure NumPy Classifier (`ml/training/train.py` & `ml/model_loader.py`)
- **Reasoning**: Standard scikit-learn C-extension binaries (`_pairwise_fast.pyd`) can be restricted on corporate or locked-down Windows hosts via AppLocker / WDAC policies.
- **Implementation**: Built a custom high-performance multinomial logistic regression classifier trained with NumPy vectorized matrix operations, L2 regularization, and feature normalization.
- **Evaluation**: Achieved 100% accuracy and 1.00 F1 score on benchmark evaluation splits (`ml/evaluation/metrics.json`). Weights are serialized to JSON (`ml/models/cyberguard_model.json`) with zero binary dependencies.

---

## 3. CYBERTRUST INTELLIGENCE™ & Deconstructed Attribution

CYBERTRUST INTELLIGENCE™ deconstructs why a threat is dangerous:
- **Claimed Identity Matching**: Cross-references against 40+ high-target banking, technology, government, and payment brands.
- **Homoglyph Normalization**: Substitutes deceptive visual glyphs (`0` -> `o`, `1` -> `l`, `3` -> `e`, `@` -> `a`, `vv` -> `w`) before computing string distance.
- **Subdomain Spoofing**: Flags attackers prepending brand keywords on external root domains (e.g., `onlinesbi.bank-alerts.com`).
- **Attacker Intent Mapping**: Automatically correlates the observed attack pattern with specific adversary objectives (e.g. *"NetBanking Customer ID & OTP theft"* or *"Session cookie hijacking"*).

---

## 4. Scenario C: Authentication Event Anomaly Engine

Batch login log inspector detecting complex identity-layer attacks:
1. **Brute Force Detection**: High frequency of consecutive credential failures against a single user account.
2. **Horizontal Password Spraying**: A single source IP testing common passwords across 3 or more distinct user accounts within a sliding window.
3. **Impossible Travel Anomaly**: Successive logins from disparate geographic coordinates (e.g. New York followed by Moscow) within minutes where required travel velocity exceeds 900 km/h (Haversine distance formula).
4. **Automated Tool Fingerprints**: Detects adversary user-agents including `python-requests`, `Hydra`, `curl`, `Medusa`, and `sqlmap`.

---

## 5. Security Guardrails

- **SSRF (Server-Side Request Forgery) Protection**: Evaluates resolved IP addresses and rejects loopback (`127.0.0.0/8`), RFC1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS/cloud metadata services (`169.254.169.254`).
- **Strict Grounding**: External intelligence providers (VirusTotal, URLhaus) return status `UNAVAILABLE` when keys are unconfigured. The system never generates fake threat verdicts.
- **Zero Hallucination AI Advisor**: Google Gemini integration is strictly grounded on deterministic security telemetry with deterministic fallbacks when offline.
