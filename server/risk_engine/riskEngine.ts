/**
 * CYBERGUARD - Composite Risk Engine
 * Combines ML Model Probabilities, CyberTrust Intelligence, Rule Engine Heuristics,
 * and NLP Signals into a transparent, multi-dimensional risk score (0-100).
 *
 * Scoring Bands:
 *   0–30:  SAFE ("Based on available signals, this appears low risk")
 *   31–60: SUSPICIOUS
 *   61–80: HIGH RISK
 *   81–100: CRITICAL
 *
 * Strict Safety Principle: Clearly separates Risk Score from ML Model Confidence.
 */

import { URLFeatureVector } from '../features/urlFeatures.js';
import { CyberTrustAnalysis } from '../identity/cybertrust.js';
import { MLInferenceResult } from '../ml/model.js';
import { ThreatIntelResult } from '../threat_intel/reputation.js';
import { NLPTacticIndicator } from '../nlp/messageAnalyzer.js';

export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
export type ThreatType =
  | 'BENIGN_LEGITIMATE'
  | 'BRAND_IMPERSONATION'
  | 'CREDENTIAL_HARVESTING'
  | 'PHISHING_ATTACK'
  | 'SOCIAL_ENGINEERING_SCAM'
  | 'INFRASTRUCTURE_ANOMALY';

export interface RiskIndicatorSignal {
  indicator: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  points: number;
  explanation: string;
}

export interface RiskEngineResult {
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  threat_type: ThreatType;
  model_confidence: number; // Distinguish from risk score!
  score_breakdown: {
    ml_contribution: number;
    cybertrust_contribution: number;
    heuristics_contribution: number;
    nlp_contribution: number;
  };
  signals: RiskIndicatorSignal[];
  attack_goal: string;
  recommendations: string[];
  limitations: string[];
}

export class RiskEngine {
  public computeRisk(params: {
    features: URLFeatureVector;
    cybertrust: CyberTrustAnalysis;
    ml_result: MLInferenceResult;
    threat_intel?: ThreatIntelResult;
    nlp_signals?: NLPTacticIndicator[];
  }): RiskEngineResult {
    const { features, cybertrust, ml_result, threat_intel, nlp_signals = [] } = params;

    let points = 5; // Base minimal exploratory baseline
    const signals: RiskIndicatorSignal[] = [];
    const limitations: string[] = [];

    // Track component breakdown
    let mlScore = 0;
    let cyberTrustScore = 0;
    let heuristicsScore = 0;
    let nlpScore = 0;

    // ==========================================
    // 1. CYBERTRUST INTELLIGENCE SIGNALS
    // ==========================================
    if (cybertrust.impersonation_status === 'POTENTIAL_IMPERSONATION') {
      const pts = 42;
      points += pts;
      cyberTrustScore += pts;
      signals.push({
        indicator: 'Unauthorized Brand Impersonation',
        severity: 'CRITICAL',
        points: pts,
        explanation: `Target claims or embeds branding of ${cybertrust.claimed_identity}, but is hosted on an unverified domain.`
      });
    } else if (cybertrust.impersonation_status === 'TYPOSQUATTING_DETECTED') {
      const pts = 45;
      points += pts;
      cyberTrustScore += pts;
      signals.push({
        indicator: 'Deceptive Look-alike / Typosquatting',
        severity: 'CRITICAL',
        points: pts,
        explanation: `Domain mimics legitimate trademark of ${cybertrust.claimed_identity} via character substitution or deceptive spelling.`
      });
    } else if (cybertrust.impersonation_status === 'OFFICIAL_VERIFIED' || cybertrust.impersonation_status === 'OFFICIAL_SUBDOMAIN') {
      // Significantly suppress score for verified corporate domains
      points = Math.max(0, points - 35);
      signals.push({
        indicator: 'Verified Official Brand Entity',
        severity: 'LOW',
        points: -35,
        explanation: `Domain cryptographically and structurally matches the verified registry for ${cybertrust.claimed_identity}.`
      });
    }

    // ==========================================
    // 2. ML CLASSIFICATION SIGNAL
    // ==========================================
    // Weight ML probability safely (up to 30 points)
    const malProb = ml_result.probabilities.malicious;
    const mlPoints = Math.round(malProb * 30);
    points += mlPoints;
    mlScore += mlPoints;

    if (ml_result.predicted_class === 'MALICIOUS') {
      signals.push({
        indicator: 'ML Phishing Probability High',
        severity: 'HIGH',
        points: mlPoints,
        explanation: `Statistical model classified lexical structure as Malicious with ${ml_result.model_confidence}% classifier confidence.`
      });
    } else if (ml_result.predicted_class === 'SUSPICIOUS') {
      signals.push({
        indicator: 'ML Structural Anomaly Flagged',
        severity: 'MEDIUM',
        points: mlPoints,
        explanation: `Statistical model identified anomalous lexical density with ${ml_result.model_confidence}% classifier confidence.`
      });
    }

    // ==========================================
    // 3. HEURISTICS & RULE ENGINE SIGNALS
    // ==========================================
    if (features.is_ip_address) {
      const pts = 25;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'Raw IP Address Host',
        severity: 'HIGH',
        points: pts,
        explanation: 'Destination resolves to a numeric IP rather than a registered, reputated domain.'
      });
    }

    if (features.suspicious_tld_flag) {
      const pts = 14;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'High-Abuse Top Level Domain',
        severity: 'MEDIUM',
        points: pts,
        explanation: `TLD .${features.tld} displays disproportionately elevated malicious activity in global threat telemetry.`
      });
    }

    if (features.num_at_symbols > 0) {
      const pts = 20;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'RFC 3986 Authority Masking (@)',
        severity: 'HIGH',
        points: pts,
        explanation: 'Presence of @ symbol obscures true destination host in user interface address bars.'
      });
    }

    if (features.num_hyphens >= 2) {
      const pts = Math.min(12, features.num_hyphens * 4);
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'Deceptive Domain Hyphenation',
        severity: 'MEDIUM',
        points: pts,
        explanation: `Observed ${features.num_hyphens} hyphens in domain, standard practice in phishing domain generation.`
      });
    }

    if (features.has_login_keyword && !cybertrust.trust_signals.is_official_domain) {
      const pts = 12;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'Credential Harvester Keyword',
        severity: 'MEDIUM',
        points: pts,
        explanation: 'Keywords soliciting login/credentials present on non-verified domain.'
      });
    }

    if (features.has_verify_keyword && !cybertrust.trust_signals.is_official_domain) {
      const pts = 10;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'Identity / Verification Lure Keyword',
        severity: 'MEDIUM',
        points: pts,
        explanation: 'Keywords soliciting verification/KYC present on unverified domain.'
      });
    }

    if (!features.is_https && !cybertrust.trust_signals.is_official_domain) {
      const pts = 10;
      points += pts;
      heuristicsScore += pts;
      signals.push({
        indicator: 'Unencrypted Transport Protocol',
        severity: 'LOW',
        points: pts,
        explanation: 'Unencrypted plaintext HTTP communication. Vulnerable to network eavesdropping and tampering.'
      });
    }

    // ==========================================
    // 4. NLP SOCIAL ENGINEERING SIGNALS
    // ==========================================
    for (const nlpSig of nlp_signals) {
      let pts = 0;
      if (nlpSig.severity === 'CRITICAL') pts = 20;
      else if (nlpSig.severity === 'HIGH') pts = 14;
      else if (nlpSig.severity === 'MEDIUM') pts = 8;
      else pts = 4;

      points += pts;
      nlpScore += pts;
      signals.push({
        indicator: `NLP: ${nlpSig.name}`,
        severity: nlpSig.severity,
        points: pts,
        explanation: nlpSig.explanation
      });
    }

    // Cap composite score between 0 and 100
    // If official verified domain with no malicious payload, cap at 15
    if (cybertrust.trust_signals.is_official_domain) {
      points = Math.min(18, points);
    }
    const finalScore = Math.min(100, Math.max(2, points));

    // Determine Risk Level according to the transparent bands
    let riskLevel: RiskLevel;
    if (finalScore <= 30) riskLevel = 'SAFE';
    else if (finalScore <= 60) riskLevel = 'SUSPICIOUS';
    else if (finalScore <= 80) riskLevel = 'HIGH RISK';
    else riskLevel = 'CRITICAL';

    // Determine Threat Type
    let threatType: ThreatType = 'BENIGN_LEGITIMATE';
    if (cybertrust.impersonation_status === 'POTENTIAL_IMPERSONATION' || cybertrust.impersonation_status === 'TYPOSQUATTING_DETECTED') {
      threatType = features.has_login_keyword || features.has_verify_keyword
        ? 'CREDENTIAL_HARVESTING'
        : 'BRAND_IMPERSONATION';
    } else if (finalScore >= 61) {
      threatType = nlp_signals.length > 0 ? 'SOCIAL_ENGINEERING_SCAM' : 'PHISHING_ATTACK';
    } else if (features.is_ip_address) {
      threatType = 'INFRASTRUCTURE_ANOMALY';
    }

    // Build Actionable Recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH RISK') {
      recommendations.push('Do NOT enter passwords, OTP codes, banking credentials, or personal identity details.');
      recommendations.push('Do NOT click links, download attachments, or call phone numbers mentioned in the source.');
      if (cybertrust.claimed_identity && cybertrust.official_domains.length > 0) {
        recommendations.push(`Access ${cybertrust.claimed_identity} only via their verified web address: https://${cybertrust.official_domains[0]}`);
      }
      recommendations.push('Report this incident to your internal security/SOC team or national cybercrime portal.');
    } else if (riskLevel === 'SUSPICIOUS') {
      recommendations.push('Exercise caution. Verify the destination domain in your browser address bar.');
      recommendations.push('Ensure the SSL padlock is issued to the legitimate corporate entity.');
      recommendations.push('Do not share sensitive 2FA authorization codes.');
    } else {
      recommendations.push('Based on available signals, this URL appears low risk.');
      recommendations.push('Always confirm the address bar begins with https:// before submitting confidential information.');
    }

    // Explicitly document limitations & unverified external channels
    if (!threat_intel || threat_intel.status === 'UNAVAILABLE') {
      limitations.push('External threat intelligence feed unavailable / unconfigured; verdict is derived from local CyberTrust & heuristic engines.');
    }
    limitations.push('CyberGuard operates as an explainable risk assessment system; zero-day malicious domains registered in the last hour may not yet have reputation history.');

    return {
      risk_score: finalScore,
      risk_level: riskLevel,
      threat_type: threatType,
      model_confidence: ml_result.model_confidence,
      score_breakdown: {
        ml_contribution: mlScore,
        cybertrust_contribution: cyberTrustScore,
        heuristics_contribution: heuristicsScore,
        nlp_contribution: nlpScore
      },
      signals,
      attack_goal: cybertrust.attack_goal,
      recommendations,
      limitations
    };
  }
}

export const riskEngine = new RiskEngine();
