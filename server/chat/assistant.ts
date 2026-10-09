/**
 * CYBERGUARD AI ASSISTANT Service
 * Specialized conversational cybersecurity expert powered by Gemini (gemini-3.8-flash).
 * Grounded on CyberTrust Intelligence™, deterministic evidence, and prioritized defensive guidance.
 */

import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ScanContextPayload {
  target?: string;
  risk_score?: number;
  risk_level?: string;
  threat_type?: string;
  claimed_identity?: string | null;
  impersonation_detected?: boolean;
  attack_goal?: string;
  signals?: Array<{ indicator: string; severity: string; explanation: string }>;
  recommendations?: string[];
  why_flagged?: string[];
  official_domains?: string[];
}

const SYSTEM_INSTRUCTION = `You are CYBERGUARD AI ASSISTANT, the dedicated cybersecurity assistant inside the CYBERGUARD platform.
Your purpose is to help users understand, analyze, and respond safely to cybersecurity threats.

CYBERGUARD focuses on:
- Phishing & Malicious URLs
- Scam messages (SMS, WhatsApp, Telegram, job/lottery/crypto scams)
- Suspicious emails & sender impersonation
- Digital/brand impersonation & look-alike domains
- Credential & OTP theft
- Social engineering manipulation

YOUR PERSONALITY:
- Professional, Friendly, Calm, Clear, Security-focused.
- Easy for non-technical users to understand.
- You are NOT a generic chatbot. You are a specialized cybersecurity defense guide.

CORE PRINCIPLES:
1. EXPLAINABLE SECURITY: Always explain "WHY". Never just say "This is phishing". Explain what was detected, why it is suspicious, what the attacker wants, and what the user should do.
2. CYBERTRUST INTELLIGENCE™: Explain claimed identity, official vs observed domains, typosquatting, and use wording like "Potential impersonation detected" rather than "This definitely belongs to an attacker".
3. RISK SCORE TRANSPARENCY: Risk score is 0-100 (0-30 SAFE/LOW, 31-60 SUSPICIOUS, 61-80 HIGH RISK, 81-100 CRITICAL). Never present risk score as a mathematical probability of maliciousness (do NOT say "95% chance it is malware"; say "CYBERGUARD assigned a risk score of 95/100 based on the detected indicators").
4. INCIDENT RESPONSE: If a user says "I clicked a link", "I entered my password", or "I gave my OTP", remain calm and provide prioritized, actionable defensive steps:
   - Stop interacting immediately.
   - Change password on the official website/app.
   - Enable multi-factor authentication (MFA).
   - Review account & financial activity.
   - Contact official support or bank fraud department.
   NEVER ask users for passwords, OTPs, or private keys.
5. NO HALLUCINATION: Only cite evidence provided in the scan context. If external threat intelligence or WHOIS was not performed, state truthfully: "I don't have evidence for that check" or "That check was not performed."
6. SAFETY FIRST: Strictly defensive. Refuse requests to create phishing kits, malware, or bypass security.
7. FORMAT PREFERENCE for threat analysis questions:
   🔍 Assessment
   ⚠️ Risk Level
   🧠 Why
   🎯 Possible Attack
   🛡️ What You Should Do`;

export class AssistantService {
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
        console.warn('[CyberGuard Assistant] Failed to init GenAI:', err);
        this.aiClient = null;
      }
    }
  }

  public async chat(params: {
    messages: ChatMessage[];
    scanContext?: ScanContextPayload | null;
  }): Promise<{ reply: string; model_used: string }> {
    const { messages, scanContext } = params;
    const latestUserMsg = messages[messages.length - 1]?.content || '';

    // If Gemini is not configured, use knowledgeable deterministic fallback
    if (!this.aiClient || !process.env.GEMINI_API_KEY) {
      return {
        reply: this.generateDeterministicReply(latestUserMsg, scanContext),
        model_used: 'CyberGuard Knowledge Engine (Deterministic Fallback)'
      };
    }

    try {
      // Build context preface if scan context exists
      let contextPrompt = '';
      if (scanContext && scanContext.target) {
        contextPrompt = `\n\nCURRENT CYBERGUARD ACTIVE SCAN CONTEXT:\n` +
          `- Target: ${scanContext.target}\n` +
          `- Risk Score: ${scanContext.risk_score ?? 'N/A'}/100 (${scanContext.risk_level ?? 'N/A'})\n` +
          `- Threat Type: ${scanContext.threat_type ?? 'N/A'}\n` +
          `- Claimed Identity: ${scanContext.claimed_identity ?? 'None / Unrecognized'}\n` +
          `- Potential Impersonation: ${scanContext.impersonation_detected ? 'YES' : 'NO'}\n` +
          `- Official Domains for Brand: ${scanContext.official_domains?.join(', ') || 'N/A'}\n` +
          `- Estimated Attack Goal: ${scanContext.attack_goal ?? 'N/A'}\n` +
          `- Detected Indicators: ${scanContext.signals?.map(s => `[${s.severity}] ${s.indicator}: ${s.explanation}`).join('; ') || 'None'}\n` +
          `- Recommendations: ${scanContext.recommendations?.join('; ') || 'None'}\n\n` +
          `Use this scan context if the user's question relates to the scan or threat assessment.\n`;
      }

      // Convert conversation history into Gemini format
      const formattedContents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Append system prompt & scan context to systemInstruction
      const fullSystemInstruction = SYSTEM_INSTRUCTION + contextPrompt;

      const generatePromise = this.aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
          topP: 0.95
        }
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Assistant call timed out after 6000ms')), 6000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const replyText = response?.text;

      if (!replyText) {
        return {
          reply: this.generateDeterministicReply(latestUserMsg, scanContext),
          model_used: 'CyberGuard Knowledge Engine (Fallback)'
        };
      }

      return {
        reply: replyText,
        model_used: 'gemini-3.8-flash'
      };
    } catch (err: any) {
      console.warn('[CyberGuard Assistant] Gemini API error, falling back:', err?.message);
      return {
        reply: this.generateDeterministicReply(latestUserMsg, scanContext),
        model_used: 'CyberGuard Knowledge Engine (Fallback)'
      };
    }
  }

  private generateDeterministicReply(
    userQuery: string,
    scanContext?: ScanContextPayload | null
  ): string {
    const q = userQuery.toLowerCase();

    // 1. Incident Response questions
    if (q.includes('entered my password') || q.includes('clicked') || q.includes('gave my otp') || q.includes('compromised')) {
      return `### 🛡️ Immediate Incident Response Steps

Don't panic. Take these prioritized actions immediately:

1. **Disconnect & Close**: Close the suspicious page and do not interact further.
2. **Change Passwords**: Immediately visit the **official website** (type the official address directly) and change your password.
3. **Revoke Sessions & Enable 2FA**: If possible, choose "Log out of all other sessions" and enable an authenticator app (Google Authenticator / YubiKey).
4. **Alert Your Bank / Financial Institution**: If you submitted banking details, card numbers, or OTPs, call your bank's fraud hotline right away to freeze cards or block NetBanking.
5. **Check Account Activity**: Review recent transactions, login history, and authorized email/phone settings.

*Remember: Legitimate banks and services will NEVER ask you to surrender an OTP over the phone or plain text.*`;
    }

    // 2. Questions about active scan
    if (scanContext && (q.includes('this url') || q.includes('this scan') || q.includes('risky') || q.includes('trust this') || q.includes('why'))) {
      const isImpersonation = scanContext.impersonation_detected;
      const claimed = scanContext.claimed_identity || 'an unknown entity';
      const score = scanContext.risk_score ?? 85;

      return `🔍 **Assessment**:
CYBERGUARD assessed **${scanContext.target || 'the target'}** with a Risk Score of **${score}/100** (${scanContext.risk_level || 'CRITICAL'}).

⚠️ **Risk Level**: ${scanContext.risk_level || 'CRITICAL'}

🧠 **Why It Was Flagged**:
${isImpersonation ? `- **Potential Brand Impersonation**: The target incorporates branding or terminology of **${claimed}**, but is hosted on an unverified third-party domain.` : '- **Structural Anomaly**: Lexical properties match patterns commonly associated with deceptive threat infrastructure.'}
- Detected Signals: ${scanContext.signals?.map(s => s.indicator).slice(0, 3).join(', ') || 'Domain mismatch, suspicious login keywords'}.

🎯 **Possible Attack**:
${scanContext.attack_goal || 'Credential harvesting and unauthorized account takeover.'}

🛡️ **What You Should Do**:
- Do **not** enter passwords, OTP codes, or personal information.
${scanContext.official_domains?.length ? `- Only access ${claimed} through their verified address: **https://${scanContext.official_domains[0]}**` : '- Only navigate via bookmarks or official channels.'}`;
    }

    // 3. What is CyberTrust Intelligence?
    if (q.includes('cybertrust') || q.includes('what is cybertrust')) {
      return `### 🛡️ What is CYBERTRUST INTELLIGENCE™?

**CYBERTRUST INTELLIGENCE™** is CYBERGUARD's signature capability. It answers the fundamental question:

> *"Why should I trust this?"*

Instead of merely calculating a generic probability number, CyberTrust examines:
- **Claimed Identity**: Does this link or message attempt to look like a known brand (e.g. SBI, PayPal, Google, Amazon)?
- **Official Domain Registry**: Does the actual host match the verified corporate domain?
- **Typosquatting & Look-alikes**: Uses Levenshtein distance and character replacement analysis to detect deceptive domains like \`sbi-secure-login-example.com\` or \`paypa1.com\`.
- **Attack Motivation**: Determines whether the threat aims to harvest credentials, intercept 2FA OTPs, or deliver social-engineering task scams.`;
    }

    // 4. What is phishing / typosquatting educational queries
    if (q.includes('what is phishing')) {
      return `### 🎣 What is Phishing?

**Phishing** is a social-engineering attack where cybercriminals impersonate trusted organizations (like banks, payment services, or tech companies) to deceive you into revealing sensitive information.

**How it works**:
1. **The Lure**: You receive an urgent email or SMS claiming your account is blocked in 30 minutes.
2. **The Deception**: A link directs you to a look-alike website that looks identical to the real portal.
3. **The Harvest**: When you enter your credentials or OTP, the attacker captures them in real time.

**Golden Rule**: Never click verification links in unsolicited messages. Type the official address directly into your browser.`;
    }

    // 5. Default welcoming response
    return `Hello! I am **CYBERGUARD AI ASSISTANT**, your cybersecurity advisor.

I can help you:
- **Explain Scan Results**: Understand why a URL, email, or message was flagged.
- **CyberTrust Intelligence™**: Learn who a website is pretending to be and whether to trust it.
- **Incident Response**: Step-by-step guidance if you entered credentials or clicked a suspicious link.
- **Scam Detection**: Identify phishing, OTP fraud, and fake job scams.

How can I assist your security today? Feel free to ask about any scan or cybersecurity topic!`;
  }
}

export const assistantService = new AssistantService();
