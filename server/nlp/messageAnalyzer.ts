/**
 * CYBERGUARD - NLP Message & Email Analysis Pipeline
 * Detects urgency, psychological fear manipulation, credential requests,
 * and high-impact scam archetypes (job scams, lottery, OTP theft, fake support).
 */

import { parseURLSafe, extractURLFeatures } from '../features/urlFeatures.js';
import { cyberTrustEngine, CyberTrustAnalysis } from '../identity/cybertrust.js';
import { mlClassifier, MLInferenceResult } from '../ml/model.js';

export interface NLPTacticIndicator {
  type: 'URGENCY' | 'FEAR_THREAT' | 'CREDENTIAL_HARVEST' | 'FINANCIAL_DEMAND' | 'SCAM_ARCHETYPE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  name: string;
  matched_text: string;
  explanation: string;
}

export interface MessageScanResult {
  message_type: 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'GENERIC_TEXT';
  scam_archetype: 'JOB_SCAM' | 'OTP_HARVESTING' | 'BANK_SUSPENSION_ALERT' | 'LOTTERY_CRYPTO' | 'TECH_SUPPORT_IMPOSTER' | 'BENIGN_SAFE';
  confidence_score: number;
  extracted_urls: string[];
  url_analyses: Array<{
    url: string;
    cybertrust: CyberTrustAnalysis;
    ml_result: MLInferenceResult;
  }>;
  tactics_detected: NLPTacticIndicator[];
  sender_analysis?: {
    claimed_sender: string;
    sender_domain_mismatch: boolean;
    explanation: string;
  };
  summary: string;
}

const URGENCY_PATTERNS = [
  { regex: /(in\s*\d+\s*(?:minutes?|mins?|hours?|hrs?))/i, name: "Tight Time Limit" },
  { regex: /(immediately|urgent|act\s*now|right\s*away|without\s*delay)/i, name: "Urgency Pressure" },
  { regex: /(within\s*24\s*hours?|final\s*notice|last\s*warning|deadline)/i, name: "Final Notice / Deadline" }
];

const FEAR_PATTERNS = [
  { regex: /(account\s*(?:will\s*be\s*)?(?:blocked|suspended|disabled|locked|terminated))/i, name: "Account Suspension Threat" },
  { regex: /(legal\s*action|arrest\s*warrant|court\s*order|law\s*enforcement|police|fbi|irs)/i, name: "Legal / Law Enforcement Threat" },
  { regex: /(unauthorized\s*access|security\s*breach|suspicious\s*activity\s*detected)/i, name: "Fabricated Security Breach" }
];

const CREDENTIAL_PATTERNS = [
  { regex: /(one-time\s*password|otp|verification\s*code|auth\s*code|security\s*pin)/i, name: "OTP / 2FA Code Harvesting" },
  { regex: /(enter\s*your\s*password|share\s*your\s*pin|cvv|card\s*number|atm\s*pin)/i, name: "Password / Banking PIN Request" },
  { regex: /(update\s*your\s*kyc|re-verify\s*identity|pan\s*card\s*details|aadhaar)/i, name: "KYC / Identity Harvesting" }
];

const FINANCIAL_PATTERNS = [
  { regex: /(wire\s*transfer|gift\s*card|crypto\s*deposit|bitcoin\s*address|advance\s*fee|processing\s*fee)/i, name: "Irreversible Payment Demands" },
  { regex: /(claim\s*your\s*(?:prize|lottery|reward|refund|cashback|\$\d+|\₹\d+))/i, name: "Fake Refund / Reward Hook" }
];

const SCAM_PATTERNS = {
  job: [
    /(earn\s*(?:\$|₹)\d+.*(?:day|daily|hour|part-time|work\s*from\s*home))/i,
    /(like\s*youtube\s*videos|hotel\s*review\s*task|telegram\s*(?:recruiter|hr|manager))/i,
    /(daily\s*salary|guaranteed\s*income|no\s*experience\s*required)/i
  ],
  lottery: [
    /(you\s*have\s*won|congratulations.*selected.*winner|sweepstakes|jackpot)/i,
    /(free\s*bitcoin|crypto\s*giveaway|airdrop\s*bonus)/i
  ],
  tech_support: [
    /(call\s*microsoft\s*support|windows\s*defender\s*alert|virus\s*detected\s*call|apple\s*support\s*toll-free)/i
  ]
};

export function extractURLsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`]+|www\.[^\s<>"{}|\\^`]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`]*)?)/gi;
  const matches = text.match(urlRegex) || [];
  // Filter out email addresses or common punctuation artifacts
  return matches
    .map(u => u.replace(/[.,;:)!]+$/, ''))
    .filter(u => !u.includes('@') && u.includes('.'));
}

export class MessageAnalyzer {
  public analyzeMessage(
    text: string,
    options?: {
      sender?: string;
      subject?: string;
      type?: 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'GENERIC_TEXT';
    }
  ): MessageScanResult {
    const fullText = `${options?.subject ? options.subject + '\n' : ''}${text}`;
    const detectedTactics: NLPTacticIndicator[] = [];

    // Check urgency
    for (const p of URGENCY_PATTERNS) {
      const match = fullText.match(p.regex);
      if (match) {
        detectedTactics.push({
          type: 'URGENCY',
          severity: 'HIGH',
          name: p.name,
          matched_text: match[0],
          explanation: `Applies psychological pressure ('${match[0]}') to bypass user skepticism.`
        });
      }
    }

    // Check fear & threats
    for (const p of FEAR_PATTERNS) {
      const match = fullText.match(p.regex);
      if (match) {
        detectedTactics.push({
          type: 'FEAR_THREAT',
          severity: 'CRITICAL',
          name: p.name,
          matched_text: match[0],
          explanation: `Uses fear-inducing threats ('${match[0]}') to intimidate the victim into rapid compliance.`
        });
      }
    }

    // Check credential harvesting
    for (const p of CREDENTIAL_PATTERNS) {
      const match = fullText.match(p.regex);
      if (match) {
        detectedTactics.push({
          type: 'CREDENTIAL_HARVEST',
          severity: 'CRITICAL',
          name: p.name,
          matched_text: match[0],
          explanation: `Directly solicits sensitive authentication tokens ('${match[0]}'). Legitimate organizations never request passwords or OTPs over plain text.`
        });
      }
    }

    // Check financial demands
    for (const p of FINANCIAL_PATTERNS) {
      const match = fullText.match(p.regex);
      if (match) {
        detectedTactics.push({
          type: 'FINANCIAL_DEMAND',
          severity: 'HIGH',
          name: p.name,
          matched_text: match[0],
          explanation: `Solicits financial interaction or promises unearned rewards ('${match[0]}').`
        });
      }
    }

    // Archetype classification
    let archetype: MessageScanResult['scam_archetype'] = 'BENIGN_SAFE';
    let archetypeConfidence = 20;

    const isJob = SCAM_PATTERNS.job.some(r => r.test(fullText));
    const isLottery = SCAM_PATTERNS.lottery.some(r => r.test(fullText));
    const isTechSupport = SCAM_PATTERNS.tech_support.some(r => r.test(fullText));
    const hasOtp = detectedTactics.some(t => t.name.includes('OTP'));
    const hasSuspension = detectedTactics.some(t => t.name.includes('Suspension'));

    if (hasOtp && (hasSuspension || detectedTactics.some(t => t.type === 'URGENCY'))) {
      archetype = 'OTP_HARVESTING';
      archetypeConfidence = 96;
      detectedTactics.push({
        type: 'SCAM_ARCHETYPE',
        severity: 'CRITICAL',
        name: 'Urgent OTP Theft Campaign',
        matched_text: 'OTP + Account Threat combo',
        explanation: 'Attacker has likely initiated a real login/transaction and needs the victim to surrender their 2FA OTP.'
      });
    } else if (hasSuspension) {
      archetype = 'BANK_SUSPENSION_ALERT';
      archetypeConfidence = 92;
      detectedTactics.push({
        type: 'SCAM_ARCHETYPE',
        severity: 'CRITICAL',
        name: 'Bank / Service Account Lock Impersonation',
        matched_text: 'Account suspension notice',
        explanation: 'Fabricated crisis designed to force immediate login on a spoofed portal.'
      });
    } else if (isJob) {
      archetype = 'JOB_SCAM';
      archetypeConfidence = 94;
      detectedTactics.push({
        type: 'SCAM_ARCHETYPE',
        severity: 'HIGH',
        name: 'Part-Time Task / Telegram Job Scam',
        matched_text: 'Remote high-pay task offer',
        explanation: 'Classic task fraud: offers unrealistic daily wages for trivial tasks, leading to cryptocurrency deposit traps.'
      });
    } else if (isLottery) {
      archetype = 'LOTTERY_CRYPTO';
      archetypeConfidence = 90;
      detectedTactics.push({
        type: 'SCAM_ARCHETYPE',
        severity: 'HIGH',
        name: 'Lottery / Crypto Advance Fee Fraud',
        matched_text: 'Prize / Giveaway claim',
        explanation: 'Lures victims with fake prizes, subsequently demanding "clearance" or "gas" fees.'
      });
    } else if (isTechSupport) {
      archetype = 'TECH_SUPPORT_IMPOSTER';
      archetypeConfidence = 95;
      detectedTactics.push({
        type: 'SCAM_ARCHETYPE',
        severity: 'CRITICAL',
        name: 'Rogue Tech Support Phone Fraud',
        matched_text: 'Urgent hotline call request',
        explanation: 'Scammers masquerade as Microsoft/Apple support to install remote access trojans (AnyDesk/TeamViewer).'
      });
    }

    // Sender domain mismatch analysis for Emails
    let senderAnalysis: MessageScanResult['sender_analysis'] = undefined;
    if (options?.sender) {
      const senderLower = options.sender.toLowerCase();
      const senderDomain = senderLower.includes('@') ? senderLower.split('@')[1] : '';
      let mismatch = false;
      let exp = 'Sender address format analyzed.';

      // Check if claimed sender claims a brand (e.g., "PayPal Security", "SBI Alert") but domain doesn't match
      const knownBrands = cyberTrustEngine.getBrands();
      for (const brand of knownBrands) {
        const mentionsBrand = brand.keywords.some(kw => senderLower.includes(kw));
        if (mentionsBrand) {
          const isOfficialSender = brand.official_domains.some(od => senderDomain === od || senderDomain.endsWith(`.${od}`));
          if (!isOfficialSender) {
            mismatch = true;
            exp = `Sender '${options.sender}' claims identity of ${brand.name}, but emails do NOT originate from verified domains (${brand.official_domains.join(', ')}).`;
            detectedTactics.push({
              type: 'SCAM_ARCHETYPE',
              severity: 'CRITICAL',
              name: 'Email Sender Spoofing / Domain Mismatch',
              matched_text: options.sender,
              explanation: exp
            });
            break;
          }
        }
      }

      senderAnalysis = {
        claimed_sender: options.sender,
        sender_domain_mismatch: mismatch,
        explanation: exp
      };
    }

    // Extract and analyze embedded URLs
    const rawUrls = extractURLsFromText(fullText);
    const urlAnalyses = rawUrls.map(url => {
      const features = extractURLFeatures(url);
      const ct = cyberTrustEngine.analyzeTrust(features, fullText);
      const ml = mlClassifier.predict(features);
      return {
        url,
        cybertrust: ct,
        ml_result: ml
      };
    });

    const msgType = options?.type || (options?.sender ? 'EMAIL' : 'SMS');

    let summaryText = 'No significant social engineering manipulation markers detected in text.';
    if (archetype !== 'BENIGN_SAFE') {
      summaryText = `Identified high-probability social engineering pattern: ${archetype.replace(/_/g, ' ')}. ${detectedTactics.length} psychological tactics detected.`;
    }

    return {
      message_type: msgType,
      scam_archetype: archetype,
      confidence_score: archetypeConfidence,
      extracted_urls: rawUrls,
      url_analyses: urlAnalyses,
      tactics_detected: detectedTactics,
      sender_analysis: senderAnalysis,
      summary: summaryText
    };
  }
}

export const messageAnalyzer = new MessageAnalyzer();
