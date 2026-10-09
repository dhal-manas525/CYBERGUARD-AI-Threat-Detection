/**
 * CYBERGUARD - Storage & Incident Repository Engine
 * Implements persistent in-memory repository conforming to the relational
 * schema (users, scans, scan_indicators, brands, reports) with aggregation stats.
 */

import { RiskEngineResult, RiskIndicatorSignal } from '../risk_engine/riskEngine.js';
import { CyberTrustAnalysis, BrandEntity } from '../identity/cybertrust.js';
import { MLInferenceResult } from '../ml/model.js';
import { AIExplanationResult } from '../explanation/aiExplainer.js';
import { URLFeatureVector } from '../features/urlFeatures.js';
import brandsSeed from '../config/brands.json' with { type: 'json' };

export interface ScanRecord {
  id: string;
  user_id: string;
  target: string;
  scan_type: 'URL' | 'EMAIL' | 'MESSAGE' | 'WEBSITE';
  risk_score: number;
  risk_level: string;
  threat_type: string;
  claimed_identity: string | null;
  impersonation_detected: boolean;
  attack_goal: string;
  explanation: AIExplanationResult;
  risk_result: RiskEngineResult;
  cybertrust: CyberTrustAnalysis;
  ml_result?: MLInferenceResult;
  features?: URLFeatureVector;
  created_at: string;
}

export interface SecurityReport {
  report_id: string;
  scan_id: string;
  generated_at: string;
  report_title: string;
  classification: string;
  executive_summary: string;
  incident_evidence: {
    target: string;
    risk_score: number;
    risk_level: string;
    claimed_identity: string | null;
    impersonation_detected: boolean;
    signals: RiskIndicatorSignal[];
  };
  recommended_actions: string[];
  markdown_export: string;
}

export interface DashboardStats {
  total_scans: number;
  critical_threats: number;
  high_risk_threats: number;
  suspicious_threats: number;
  safe_verdicts: number;
  impersonation_attempts: number;
  top_impersonated_brands: Array<{ brand: string; count: number }>;
  scan_type_breakdown: Record<string, number>;
  average_risk_score: number;
}

export class StorageRepository {
  private scans: ScanRecord[] = [];
  private brands: BrandEntity[] = [...(brandsSeed as BrandEntity[])];

  constructor() {
    this.seedInitialScans();
  }

  private seedInitialScans() {
    // Seed initial synthetic hackathon cases so the dashboard and history are populated
    const now = new Date();
    const demoItems = [
      {
        target: 'https://sbi-secure-login-example.com/verify',
        type: 'URL' as const,
        brand: 'State Bank of India',
        score: 95,
        level: 'CRITICAL',
        impersonation: true,
        threat: 'CREDENTIAL_HARVESTING',
        goal: 'Credential Harvesting & NetBanking Theft'
      },
      {
        target: 'https://www.paypal.com/signin',
        type: 'URL' as const,
        brand: 'PayPal Inc.',
        score: 12,
        level: 'SAFE',
        impersonation: false,
        threat: 'BENIGN_LEGITIMATE',
        goal: 'Legitimate corporate portal'
      },
      {
        target: 'http://192.168.1.50/paypal/login.php?update=account',
        type: 'URL' as const,
        brand: 'PayPal Inc.',
        score: 96,
        level: 'CRITICAL',
        impersonation: true,
        threat: 'CREDENTIAL_HARVESTING',
        goal: 'Direct IP Credential Harvesting'
      },
      {
        target: 'Earn $300-$800/day remote Amazon task. Contact Telegram @amazon_recruiter_hr',
        type: 'MESSAGE' as const,
        brand: 'Amazon.com Inc.',
        score: 84,
        level: 'CRITICAL',
        impersonation: true,
        threat: 'SOCIAL_ENGINEERING_SCAM',
        goal: 'Telegram Task / Advance Deposit Scam'
      },
      {
        target: 'Dear Customer, Your SBI YONO account blocked in 30 mins. Re-verify KYC now.',
        type: 'EMAIL' as const,
        brand: 'State Bank of India',
        score: 92,
        level: 'CRITICAL',
        impersonation: true,
        threat: 'SOCIAL_ENGINEERING_SCAM',
        goal: 'Urgent OTP & KYC Harvesting'
      }
    ];

    demoItems.forEach((item, index) => {
      const pastTime = new Date(now.getTime() - (index * 45 + 10) * 60000).toISOString();
      this.scans.push({
        id: `scan-${1000 + index}`,
        user_id: 'analyst-1',
        target: item.target,
        scan_type: item.type,
        risk_score: item.score,
        risk_level: item.level,
        threat_type: item.threat,
        claimed_identity: item.brand,
        impersonation_detected: item.impersonation,
        attack_goal: item.goal,
        created_at: pastTime,
        explanation: {
          executive_summary: `Analysis completed for ${item.target}. Risk evaluated at ${item.score}/100.`,
          threat_narrative: item.impersonation
            ? `Target deceptively leverages branding of ${item.brand} on unauthorized channels.`
            : `Verified domain structure corresponding to official enterprise registries.`,
          attacker_intent_breakdown: item.goal,
          plain_english_action_guide: item.impersonation
            ? 'Do not submit credentials or one-time passcodes.'
            : 'Safe to proceed under standard browsing guidelines.',
          llm_used: false,
          model_name: 'CyberGuard Pre-seeded Engine'
        },
        risk_result: {
          risk_score: item.score,
          risk_level: item.level as any,
          threat_type: item.threat as any,
          model_confidence: 94,
          score_breakdown: {
            ml_contribution: 28,
            cybertrust_contribution: item.impersonation ? 45 : 0,
            heuristics_contribution: 15,
            nlp_contribution: item.type === 'MESSAGE' || item.type === 'EMAIL' ? 20 : 0
          },
          signals: [
            {
              indicator: item.impersonation ? 'Unauthorized Brand Impersonation' : 'Verified Domain',
              severity: item.impersonation ? 'CRITICAL' : 'LOW',
              points: item.impersonation ? 45 : -30,
              explanation: item.impersonation
                ? `Unofficial domain incorporating brand identifier.`
                : `Domain matches authorized registrar.`
            }
          ],
          attack_goal: item.goal,
          recommendations: item.impersonation
            ? ['Do not enter passwords or OTP codes.', 'Access organization only via official website.']
            : ['Standard browsing safety precautions.'],
          limitations: ['Standard 24h telemetry window.']
        },
        cybertrust: {
          claimed_identity: item.brand,
          brand_entity: null,
          impersonation_status: item.impersonation ? 'POTENTIAL_IMPERSONATION' : 'OFFICIAL_VERIFIED',
          impersonation_detected: item.impersonation,
          confidence_score: 95,
          brand_similarity_score: 90,
          official_domains: [],
          attack_goal: item.goal,
          trust_signals: {
            is_official_domain: !item.impersonation,
            domain_structure_rating: item.impersonation ? 'MALICIOUS_ANOMALY' : 'VERIFIED',
            brand_keyword_abuse: item.impersonation,
            lookalike_detected: false,
            ssl_presence: true,
            tld_reputation: 'STANDARD'
          },
          why_flagged: item.impersonation ? ['Brand name in unofficial domain'] : [],
          verdict_summary: item.impersonation ? `Potential impersonation of ${item.brand}` : `Verified brand domain.`
        }
      });
    });
  }

  public saveScan(scan: Omit<ScanRecord, 'id' | 'created_at'>): ScanRecord {
    const record: ScanRecord = {
      ...scan,
      id: `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    this.scans.unshift(record);
    return record;
  }

  public getScans(limit: number = 50, typeFilter?: string): ScanRecord[] {
    let result = this.scans;
    if (typeFilter && typeFilter !== 'ALL') {
      result = result.filter(s => s.scan_type === typeFilter || s.risk_level === typeFilter);
    }
    return result.slice(0, limit);
  }

  public getScanById(id: string): ScanRecord | null {
    return this.scans.find(s => s.id === id) || null;
  }

  public getDashboardStats(): DashboardStats {
    let critical = 0;
    let high = 0;
    let suspicious = 0;
    let safe = 0;
    let impersonations = 0;
    let totalScore = 0;
    const brandCounts: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {
      URL: 0,
      EMAIL: 0,
      MESSAGE: 0,
      WEBSITE: 0
    };

    for (const scan of this.scans) {
      totalScore += scan.risk_score;
      typeBreakdown[scan.scan_type] = (typeBreakdown[scan.scan_type] || 0) + 1;

      if (scan.risk_level === 'CRITICAL') critical++;
      else if (scan.risk_level === 'HIGH RISK') high++;
      else if (scan.risk_level === 'SUSPICIOUS') suspicious++;
      else safe++;

      if (scan.impersonation_detected) {
        impersonations++;
        if (scan.claimed_identity) {
          brandCounts[scan.claimed_identity] = (brandCounts[scan.claimed_identity] || 0) + 1;
        }
      }
    }

    const topBrands = Object.entries(brandCounts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const total = this.scans.length;
    return {
      total_scans: total,
      critical_threats: critical,
      high_risk_threats: high,
      suspicious_threats: suspicious,
      safe_verdicts: safe,
      impersonation_attempts: impersonations,
      top_impersonated_brands: topBrands,
      scan_type_breakdown: typeBreakdown,
      average_risk_score: total > 0 ? Math.round(totalScore / total) : 0
    };
  }

  public generateReport(scanId: string): SecurityReport | null {
    const scan = this.getScanById(scanId);
    if (!scan) return null;

    const reportId = `REP-${scan.id.replace('scan-', '')}`;
    const dateStr = new Date().toUTCString();

    const markdown = `# CYBERGUARD™ THREAT INCIDENT REPORT
**Report ID**: ${reportId}
**Scan Target**: \`${scan.target}\`
**Date / Timestamp**: ${dateStr}
**Threat Classification**: ${scan.threat_type}
**Risk Score**: **${scan.risk_score}/100** (${scan.risk_level})

---

### 1. CYBERTRUST INTELLIGENCE™ VERDICT
- **Claimed Brand / Entity**: ${scan.claimed_identity || 'None / Not Recognized'}
- **Impersonation Status**: ${scan.cybertrust.impersonation_status}
- **Official Domains for Claimed Entity**: ${scan.cybertrust.official_domains.join(', ') || 'N/A'}
- **Estimated Attacker Goal**: ${scan.attack_goal}

### 2. EXPLAINABLE AI SUMMARY
${scan.explanation.executive_summary}

**Technical Narrative**:
${scan.explanation.threat_narrative}

**Attacker Motivation**:
${scan.explanation.attacker_intent_breakdown}

---

### 3. DETECTED FORENSIC SIGNALS
| Severity | Indicator | Explanation | Points |
| :--- | :--- | :--- | :--- |
${scan.risk_result.signals.map(s => `| **${s.severity}** | ${s.indicator} | ${s.explanation} | +${s.points} |`).join('\n')}

---

### 4. RECOMMENDED INCIDENT ACTIONS
${scan.risk_result.recommendations.map(r => `- ${r}`).join('\n')}

---
*Generated automatically by CyberGuard AI Threat Engine. CyberGuard is a risk assessment system.*
`;

    return {
      report_id: reportId,
      scan_id: scan.id,
      generated_at: dateStr,
      report_title: `Cyber Threat Incident Assessment: ${scan.claimed_identity || scan.target}`,
      classification: scan.risk_level,
      executive_summary: scan.explanation.executive_summary,
      incident_evidence: {
        target: scan.target,
        risk_score: scan.risk_score,
        risk_level: scan.risk_level,
        claimed_identity: scan.claimed_identity,
        impersonation_detected: scan.impersonation_detected,
        signals: scan.risk_result.signals
      },
      recommended_actions: scan.risk_result.recommendations,
      markdown_export: markdown
    };
  }

  public getBrands(): BrandEntity[] {
    return this.brands;
  }

  public addBrand(brand: BrandEntity): void {
    const idx = this.brands.findIndex(b => b.id === brand.id);
    if (idx >= 0) {
      this.brands[idx] = brand;
    } else {
      this.brands.push(brand);
    }
  }
}

export const storageRepo = new StorageRepository();
