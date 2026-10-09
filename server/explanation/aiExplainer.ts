/**
 * CYBERGUARD - Explainable AI Layer (Gemini-Augmented + Deterministic Fallback)
 *
 * Strict Architecture:
 * ML + CyberTrust + Risk Engine determines the raw evidence and risk scores.
 * Gemini strictly synthesizes and explains the structured evidence to human users.
 * Never invents or fabricates security findings.
 */

import { GoogleGenAI } from '@google/genai';
import { RiskEngineResult } from '../risk_engine/riskEngine.js';
import { CyberTrustAnalysis } from '../identity/cybertrust.js';
import { URLFeatureVector } from '../features/urlFeatures.js';

export interface AIExplanationResult {
  executive_summary: string;
  threat_narrative: string;
  attacker_intent_breakdown: string;
  plain_english_action_guide: string;
  llm_used: boolean;
  model_name: string;
}

// Deterministic generator used when Gemini is unconfigured or rate-limited
function generateDeterministicExplanation(
  riskResult: RiskEngineResult,
  cybertrust: CyberTrustAnalysis,
  targetInput: string
): AIExplanationResult {
  const isHighRisk = riskResult.risk_level === 'CRITICAL' || riskResult.risk_level === 'HIGH RISK';
  const isSafe = riskResult.risk_level === 'SAFE';

  let summary: string;
  let narrative: string;
  let intent: string;
  let action: string;

  if (isSafe) {
    summary = `Based on available signals, this target (${targetInput}) appears low risk (Score: ${riskResult.risk_score}/100). No indicators of domain spoofing or deceptive credential forms were identified.`;
    narrative = cybertrust.claimed_identity
      ? `The target destination aligns with the verified infrastructure of ${cybertrust.claimed_identity}. Transport encryption is active and domain structure matches expected enterprise parameters.`
      : `The domain structure, lexical attributes, and transport security are consistent with legitimate internet services. No trademark collisions detected.`;
    intent = 'Legitimate user navigation or routine corporate service access.';
    action = 'Safe to proceed under standard browsing precautions. Verify that the address bar always maintains HTTPS encryption.';
  } else if (cybertrust.impersonation_detected) {
    summary = `CRITICAL ALERT: Target is attempting to impersonate ${cybertrust.claimed_identity || 'a reputable enterprise'}. Composite risk score is ${riskResult.risk_score}/100.`;
    narrative = `The target URL uses deceptive naming patterns to simulate ${cybertrust.claimed_identity}, but is hosted on an unauthorized third-party server. Official communications only occur on [${cybertrust.official_domains.join(', ')}]. Key indicators include ${riskResult.signals.map(s => s.indicator).slice(0, 3).join(', ')}.`;
    intent = `The attacker's estimated objective is: ${riskResult.attack_goal}. They are exploiting trust in ${cybertrust.claimed_identity} to induce victims into surrendering confidential authentication data.`;
    action = `DO NOT enter any credentials, passwords, or one-time verification codes (OTPs). Immediately navigate away from this page.`;
  } else {
    summary = `WARNING: CyberGuard flagged this target with ${riskResult.risk_level} (Score: ${riskResult.risk_score}/100). Multiple anomalous patterns were identified.`;
    narrative = `Our multi-engine analysis identified suspicious characteristics: ${riskResult.signals.map(s => s.indicator).slice(0, 4).join(', ')}. The lexical and structural footprint closely resembles threat actor staging environments.`;
    intent = `Probable goal: ${riskResult.attack_goal}. The target exhibits anomalous hosting or social engineering patterns designed to circumvent user scrutiny.`;
    action = `Exercise high caution. Do not download any software, input personal credentials, or interact with forms on this destination.`;
  }

  return {
    executive_summary: summary,
    threat_narrative: narrative,
    attacker_intent_breakdown: intent,
    plain_english_action_guide: action,
    llm_used: false,
    model_name: 'CyberGuard Deterministic Rule Engine (Gemini Offline)'
  };
}

export class AIExplainer {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
        this.aiClient = null;
      }
    }
  }

  /**
   * Generates a human-comprehensible explanation grounded STRICTLY in structured findings.
   */
  public async explainFindings(params: {
    targetInput: string;
    targetType: 'URL' | 'EMAIL' | 'MESSAGE' | 'WEBSITE';
    features?: URLFeatureVector;
    cybertrust: CyberTrustAnalysis;
    riskResult: RiskEngineResult;
    rawTextContext?: string;
  }): Promise<AIExplanationResult> {
    const { targetInput, targetType, cybertrust, riskResult } = params;

    // If Gemini client is unavailable, immediately return deterministic output
    if (!this.aiClient || !process.env.GEMINI_API_KEY) {
      return generateDeterministicExplanation(riskResult, cybertrust, targetInput);
    }

    try {
      const prompt = `You are the Explainable AI engine of CYBERGUARD, an enterprise cyber defense platform.
Your task is to explain the provided STRUCTURED SECURITY FINDINGS to a human user in clean, authoritative, non-technical language.

CRITICAL CONSTRAINTS:
1. Do NOT alter or re-calculate the Risk Score (${riskResult.risk_score}/100) or Risk Level (${riskResult.risk_level}).
2. Do NOT invent new evidence, domains, or threat intelligence that is not in the findings.
3. If risk level is SAFE, use cautious language: "Based on available signals, this appears low risk" (never claim 100% safe).
4. Explain WHY the indicators matter and what the attacker might be attempting.

STRUCTURED FINDINGS:
- Target: ${targetInput} (${targetType})
- Risk Score: ${riskResult.risk_score}/100 (${riskResult.risk_level})
- Threat Type: ${riskResult.threat_type}
- Claimed Identity: ${cybertrust.claimed_identity || 'None / Unknown'}
- Impersonation Status: ${cybertrust.impersonation_status}
- Official Domains for Claimed Brand: ${cybertrust.official_domains.join(', ') || 'N/A'}
- Estimated Attack Goal: ${riskResult.attack_goal}
- Detected Signals:
${riskResult.signals.map(s => `  * [${s.severity}] ${s.indicator}: ${s.explanation}`).join('\n')}

Format your output as valid JSON matching this exact structure:
{
  "executive_summary": "1-2 sentence high-level summary of the threat and trust status",
  "threat_narrative": "Paragraph explaining why the findings are suspicious and comparing claimed brand vs reality",
  "attacker_intent_breakdown": "Explanation of what the threat actor is likely trying to accomplish",
  "plain_english_action_guide": "Clear, practical bullet points or instructions for the user"
}`;

      const generatePromise = this.aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 4000ms')), 4000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response?.text;
      if (!responseText) {
        return generateDeterministicExplanation(riskResult, cybertrust, targetInput);
      }

      const parsed = JSON.parse(responseText.trim());
      return {
        executive_summary: parsed.executive_summary || '',
        threat_narrative: parsed.threat_narrative || '',
        attacker_intent_breakdown: parsed.attacker_intent_breakdown || '',
        plain_english_action_guide: parsed.plain_english_action_guide || '',
        llm_used: true,
        model_name: 'gemini-3.8-flash (Grounding-Constrained)'
      };
    } catch (err) {
      console.warn('Gemini explanation generation encountered an error, falling back to deterministic explanation:', err);
      return generateDeterministicExplanation(riskResult, cybertrust, targetInput);
    }
  }
}

export const aiExplainer = new AIExplainer();
