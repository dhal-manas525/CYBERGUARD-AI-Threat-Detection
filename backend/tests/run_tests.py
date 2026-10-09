import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.services.brand_intelligence import analyze_brand_impersonation
from app.services.impersonation_analyzer import analyze_digital_impersonation
from app.services.auth_anomaly_detector import analyze_auth_events, get_demo_auth_scenarios
from app.services.website_analyzer import is_ssrf_safe_host
from ml.features.extractor import extract_url_features
from ml.model_loader import get_model


client = TestClient(app)


class CyberGuardTestSuite(unittest.TestCase):

    def test_01_benign_url_classification(self):
        """Verify official domain is classified as SAFE with low risk score."""
        url = "https://www.microsoft.com/en-us/microsoft-365"
        features = extract_url_features(url)
        brand_analysis = analyze_brand_impersonation(url)
        self.assertEqual(brand_analysis["identity_match_status"], "MATCH")
        self.assertFalse(brand_analysis["is_impersonation"])

        response = client.post("/api/analyze/url", json={"url": url})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["threat_level"], "SAFE")
        self.assertLessEqual(data["risk_score"], 30.0)

    def test_02_phishing_url_lookalike(self):
        """Verify deceptive banking lookalike triggers CRITICAL threat."""
        url = "http://onlinesbi-kyc-verification-portal.com/login.php"
        response = client.post("/api/analyze/url", json={"url": url})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data["threat_level"], ["HIGH RISK", "CRITICAL"])
        self.assertGreaterEqual(data["risk_score"], 70.0)
        self.assertTrue(data["cybertrust"]["is_impersonation"])
        self.assertIn("State Bank of India (SBI)", data["cybertrust"]["claimed_identity"])

    def test_03_email_threat_analysis(self):
        """Verify urgent credential demand in email is detected."""
        payload = {
            "sender": "security-alert@onlinesbi-kyc-portal.com",
            "subject": "URGENT: Your NetBanking access is suspended immediately",
            "body": "Dear customer, your SBI account is locked. Click here immediately to submit your OTP and password.",
            "links": ["http://onlinesbi-kyc-portal.com/verify"]
        }
        response = client.post("/api/analyze/email", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data["threat_level"], ["HIGH RISK", "CRITICAL"])
        self.assertTrue(data["cybertrust"]["is_impersonation"])

    def test_04_sms_message_threat_analysis(self):
        """Verify fake electricity power disconnection scam is detected."""
        payload = {
            "content": "Dear consumer, electricity power will be disconnected tonight 9:30 PM. Call officer immediately at 9876543210 or pay bill at http://power-bill-update.xyz",
            "platform": "SMS"
        }
        response = client.post("/api/analyze/message", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["risk_score"], 60.0)
        self.assertGreater(len(data["cybertrust"]["why_flagged"]), 0)

    def test_05_impersonation_exact_match(self):
        """Scenario B: Official PayPal website correctly verifies as EXACT_MATCH."""
        result = analyze_digital_impersonation(
            claimed_organization="PayPal",
            target="https://www.paypal.com/signin"
        )
        self.assertEqual(result["match_status"], "EXACT_MATCH")
        self.assertFalse(result["impersonation_detected"])
        self.assertEqual(result["threat_level"], "SAFE")
        self.assertLessEqual(result["risk_score"], 15.0)

    def test_06_impersonation_homoglyph_deception(self):
        """Scenario B: Homoglyph 'micr0s0ft' correctly identified as LOOKALIKE."""
        result = analyze_digital_impersonation(
            claimed_organization="Microsoft",
            target="http://micr0s0ft-security-auth.net/login"
        )
        self.assertEqual(result["match_status"], "LOOKALIKE_IMPERSONATION")
        self.assertTrue(result["impersonation_detected"])
        self.assertEqual(result["threat_level"], "CRITICAL")
        self.assertGreater(len(result["homoglyphs_detected"]), 0)
        self.assertEqual(result["homoglyphs_detected"][0]["character"], "0")

    def test_07_impersonation_api_endpoint(self):
        """Scenario B: Test HTTP endpoint with auto-incident creation."""
        payload = {
            "claimed_organization": "State Bank of India (SBI)",
            "target": "http://onlinesbi-kyc-alert.com/login.php",
            "auto_create_incident": True
        }
        response = client.post("/api/analyze/impersonation", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["match_status"], "LOOKALIKE_IMPERSONATION")
        self.assertTrue(data["impersonation_detected"])
        self.assertIsNotNone(data["incident_id"])

    def test_08_auth_brute_force_detection(self):
        """Scenario C: High concentration of failed logins on one account."""
        scenarios = get_demo_auth_scenarios()
        brute_force_events = scenarios["brute_force"]

        result = analyze_auth_events(brute_force_events)
        self.assertIn(result["threat_level"], ["HIGH RISK", "CRITICAL"])
        self.assertGreaterEqual(result["anomaly_score"], 70.0)
        self.assertIn("Brute Force Attack", result["attack_vectors"])
        self.assertIn("admin@cyberguard.ai", result["affected_accounts"])
        self.assertIn("185.220.101.5", result["offending_ips"])

    def test_09_auth_password_spraying_detection(self):
        """Scenario C: Single IP attempting logins across distinct accounts."""
        scenarios = get_demo_auth_scenarios()
        spray_events = scenarios["password_spraying"]

        result = analyze_auth_events(spray_events)
        self.assertIn(result["threat_level"], ["HIGH RISK", "CRITICAL"])
        self.assertIn("Horizontal Password Spraying", result["attack_vectors"])
        self.assertGreaterEqual(len(result["affected_accounts"]), 3)
        self.assertIn("45.142.214.10", result["offending_ips"])

    def test_10_auth_impossible_travel_detection(self):
        """Scenario C: Successive logins from NY and Moscow within minutes (>900 km/h)."""
        scenarios = get_demo_auth_scenarios()
        travel_events = scenarios["impossible_travel"]

        result = analyze_auth_events(travel_events)
        self.assertIn("Impossible Travel Velocity", result["attack_vectors"])
        self.assertIn("sarah.connor@cyberguard.ai", result["affected_accounts"])

    def test_11_auth_anomaly_endpoint(self):
        """Scenario C: Test HTTP endpoint with auto-incident creation."""
        scenarios = get_demo_auth_scenarios()
        spray_events = scenarios["password_spraying"]

        response = client.post("/api/analyze/auth-events", json={
            "events": spray_events,
            "auto_create_incident": True
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["anomaly_score"], 70.0)
        self.assertIsNotNone(data["incident_id"])

    def test_12_incident_lifecycle_workflow(self):
        """Test full incident workflow: Create -> Read -> Mutate Status -> Verify."""
        payload = {
            "title": "Test Incident: Suspicious Token Infiltration",
            "threat_level": "HIGH RISK",
            "scenario_type": "AUTH_ANOMALY",
            "target": "user: secops_lead@cyberguard.ai",
            "risk_score": 75.0,
            "status": "New",
            "assigned_to": "analyst@cyberguard.ai",
            "notes": "Initial alert detected from edge proxy."
        }
        res_create = client.post("/api/incidents", json=payload)
        self.assertEqual(res_create.status_code, 201)
        created_data = res_create.json()
        inc_id = created_data["incident_id"]
        self.assertEqual(created_data["status"], "New")

        # Mutate to 'Investigating'
        res_patch1 = client.patch(f"/api/incidents/{inc_id}", json={
            "status": "Investigating",
            "notes": "Analyst inspecting firewall session tokens."
        })
        self.assertEqual(res_patch1.status_code, 200)
        self.assertEqual(res_patch1.json()["status"], "Investigating")

        # Mutate to 'Mitigated'
        res_patch2 = client.patch(f"/api/incidents/{inc_id}", json={
            "status": "Mitigated",
            "notes": "Offending IP blocked on border gateway."
        })
        self.assertEqual(res_patch2.status_code, 200)
        self.assertEqual(res_patch2.json()["status"], "Mitigated")

        # Mutate to 'Closed'
        res_patch3 = client.patch(f"/api/incidents/{inc_id}", json={
            "status": "Closed",
            "notes": "Incident fully contained. Post-mortem archived."
        })
        self.assertEqual(res_patch3.status_code, 200)
        self.assertEqual(res_patch3.json()["status"], "Closed")

    def test_13_ssrf_protection(self):
        """Verify local loopback and RFC 1918 private IPs are rejected."""
        self.assertFalse(is_ssrf_safe_host("127.0.0.1"))
        self.assertFalse(is_ssrf_safe_host("10.0.0.1"))
        self.assertFalse(is_ssrf_safe_host("192.168.1.1"))
        self.assertFalse(is_ssrf_safe_host("169.254.169.254"))
        self.assertTrue(is_ssrf_safe_host("8.8.8.8"))

    def test_14_gemini_assistant_deterministic_fallback(self):
        """Verify conversational assistant responds gracefully with deterministic fallback."""
        response = client.post("/api/assistant/chat", json={
            "messages": [
                {"role": "user", "content": "I accidentally clicked a phishing link and entered my password. What do I do?"}
            ]
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue("Incident Response Protocol" in data["reply"] or "password" in data["reply"].lower())
        self.assertGreater(len(data["reply"]), 50)

    def test_15_invalid_gibberish_url_rejected(self):
        """Verify random unbroken string without domain extension is rejected."""
        response = client.post("/api/analyze/url", json={"url": "jbhiuoihgiepghi"})
        self.assertEqual(response.status_code, 422)

        response2 = client.post("/api/analyze/website", json={"url": "justrandomtextwithoutdot"})
        self.assertEqual(response2.status_code, 422)

    def test_16_invalid_email_sender_rejected(self):
        """Verify malformed email sender without @ or domain is rejected."""
        response = client.post("/api/analyze/email", json={
            "sender": "jbhiuoihgiepghi",
            "subject": "Urgent update",
            "body": "Please click the link"
        })
        self.assertEqual(response.status_code, 422)

    def test_17_invalid_short_message_rejected(self):
        """Verify trivial/empty message content is rejected."""
        response = client.post("/api/analyze/message", json={"content": "hi"})
        self.assertEqual(response.status_code, 422)

    def test_18_invalid_impersonation_target_rejected(self):
        """Verify gibberish target destination without TLD is rejected."""
        response = client.post("/api/analyze/impersonation", json={
            "claimed_organization": "PayPal",
            "target": "jbhiuoihgiepghi"
        })
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
