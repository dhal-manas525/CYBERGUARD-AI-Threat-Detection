/**
 * CYBERTRUST INTELLIGENCE™ Engine
 * Signature module of CYBERGUARD.
 * Answers: "Why should I trust this?" and "Who is behind it?"
 */

import brandsData from '../config/brands.json' with { type: 'json' };
import { URLFeatureVector } from '../features/urlFeatures.js';

export interface BrandEntity {
  id: string;
  name: string;
  shortName: string;
  official_domains: string[];
  keywords: string[];
  category: string;
  country: string;
  critical_assets: string[];
}

export type ImpersonationStatus =
  | 'OFFICIAL_VERIFIED'
  | 'OFFICIAL_SUBDOMAIN'
  | 'POTENTIAL_IMPERSONATION'
  | 'TYPOSQUATTING_DETECTED'
  | 'UNRELATED_ORGANIZATION'
  | 'NO_CLAIMED_IDENTITY';

export interface CyberTrustAnalysis {
  claimed_identity: string | null;
  brand_entity: BrandEntity | null;
  impersonation_status: ImpersonationStatus;
  impersonation_detected: boolean;
  confidence_score: number; // 0-100
  brand_similarity_score: number; // 0-100
  official_domains: string[];
  attack_goal: string;
  trust_signals: {
    is_official_domain: boolean;
    domain_structure_rating: 'VERIFIED' | 'SUSPICIOUS' | 'MALICIOUS_ANOMALY';
    brand_keyword_abuse: boolean;
    lookalike_detected: boolean;
    ssl_presence: boolean;
    tld_reputation: 'TRUSTED' | 'STANDARD' | 'SUSPICIOUS_HIGH_RISK';
  };
  why_flagged: string[];
  verdict_summary: string;
}

/**
 * Standard Levenshtein distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Calculates string similarity percentage (0-100)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

/**
 * Homoglyph and lookalike character mapping (common in typosquatting)
 */
const HOMOGLYPH_MAP: Record<string, string> = {
  '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '8': 'b',
  'vv': 'w', 'rn': 'm', 'cl': 'd'
};

export function normalizeLookalikes(input: string): string {
  let normalized = input.toLowerCase();
  for (const [synthetic, original] of Object.entries(HOMOGLYPH_MAP)) {
    normalized = normalized.replaceAll(synthetic, original);
  }
  return normalized;
}

export class CyberTrustEngine {
  private brands: BrandEntity[];

  constructor(customBrands?: BrandEntity[]) {
    this.brands = customBrands && customBrands.length > 0 ? customBrands : (brandsData as BrandEntity[]);
  }

  public getBrands(): BrandEntity[] {
    return this.brands;
  }

  public addBrand(brand: BrandEntity): void {
    const existingIndex = this.brands.findIndex(b => b.id === brand.id);
    if (existingIndex >= 0) {
      this.brands[existingIndex] = brand;
    } else {
      this.brands.push(brand);
    }
  }

  /**
   * Main CyberTrust analysis on extracted URL features and text
   */
  public analyzeTrust(
    features: URLFeatureVector,
    contextText: string = ''
  ): CyberTrustAnalysis {
    const hostname = features.domain_registered.toLowerCase();
    const fullHost = (features.subdomain_part ? `${features.subdomain_part}.${hostname}` : hostname).toLowerCase();
    const fullUrlLower = `${fullHost}${features.path_part}`.toLowerCase();
    const combinedContext = `${fullUrlLower} ${contextText.toLowerCase()}`;

    let matchedBrand: BrandEntity | null = null;
    let highestSimilarity = 0;
    let matchReason = '';
    let isTyposquat = false;

    // Check each known brand
    for (const brand of this.brands) {
      // 1. Exact official domain match
      for (const officialDomain of brand.official_domains) {
        if (fullHost === officialDomain || fullHost.endsWith(`.${officialDomain}`)) {
          matchedBrand = brand;
          highestSimilarity = 100;
          matchReason = 'exact_domain';
          break;
        }
      }
      if (matchedBrand) break;

      // 2. Look for brand keyword or brand name inside hostname/subdomain
      for (const kw of brand.keywords) {
        const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanHost = hostname.replace(/[^a-z0-9]/g, '');

        if (cleanHost.includes(cleanKw) || fullHost.includes(cleanKw)) {
          matchedBrand = brand;
          highestSimilarity = 95;
          matchReason = 'brand_keyword_in_host';
          break;
        }

        // 3. Typosquatting / Levenshtein distance check on core domain name
        const hostWithoutTld = hostname.split('.')[0] || '';
        const normHost = normalizeLookalikes(hostWithoutTld);
        const dist = levenshteinDistance(normHost, cleanKw);

        if (dist === 1 && cleanKw.length >= 4) {
          matchedBrand = brand;
          highestSimilarity = 90;
          isTyposquat = true;
          matchReason = 'typosquat_lookalike';
          break;
        } else if (dist === 2 && cleanKw.length >= 7) {
          matchedBrand = brand;
          highestSimilarity = 82;
          isTyposquat = true;
          matchReason = 'typosquat_lookalike';
          break;
        }
      }

      if (matchedBrand) break;

      // 4. Check context text or path for prominent brand mentions
      for (const kw of brand.keywords) {
        if (combinedContext.includes(kw) && (features.has_login_keyword || features.has_verify_keyword || features.has_banking_keyword)) {
          matchedBrand = brand;
          highestSimilarity = 75;
          matchReason = 'brand_in_context_or_path';
          break;
        }
      }
      if (matchedBrand) break;
    }

    // Default if no brand was identified
    if (!matchedBrand) {
      return {
        claimed_identity: null,
        brand_entity: null,
        impersonation_status: 'NO_CLAIMED_IDENTITY',
        impersonation_detected: false,
        confidence_score: 15,
        brand_similarity_score: 0,
        official_domains: [],
        attack_goal: features.has_login_keyword ? 'Generic credential collection' : 'Informational / Undetermined',
        trust_signals: {
          is_official_domain: false,
          domain_structure_rating: features.is_ip_address ? 'MALICIOUS_ANOMALY' : (features.suspicious_tld_flag ? 'SUSPICIOUS' : 'VERIFIED'),
          brand_keyword_abuse: false,
          lookalike_detected: false,
          ssl_presence: features.is_https,
          tld_reputation: features.suspicious_tld_flag ? 'SUSPICIOUS_HIGH_RISK' : 'STANDARD'
        },
        why_flagged: features.is_ip_address
          ? ['Host uses raw IP address instead of legitimate registered domain name.']
          : [],
        verdict_summary: 'No recognized brand or enterprise identity claimed by this host.'
      };
    }

    // Evaluate Impersonation Status against official domains
    const isOfficial = matchedBrand.official_domains.some(
      official => fullHost === official || fullHost.endsWith(`.${official}`)
    );

    let status: ImpersonationStatus = 'UNRELATED_ORGANIZATION';
    const whyFlagged: string[] = [];

    if (isOfficial) {
      status = fullHost.includes('.') && !matchedBrand.official_domains.includes(fullHost)
        ? 'OFFICIAL_SUBDOMAIN'
        : 'OFFICIAL_VERIFIED';
    } else if (isTyposquat) {
      status = 'TYPOSQUATTING_DETECTED';
      whyFlagged.push(`Domain closely mimics known official domain (possible typosquatting or character substitution for ${matchedBrand.name}).`);
      whyFlagged.push(`Domain does not match verified official domains: ${matchedBrand.official_domains.join(', ')}.`);
    } else {
      status = 'POTENTIAL_IMPERSONATION';
      whyFlagged.push(`Domain incorporates brand token '${matchedBrand.shortName}' but is NOT hosted on a verified official domain.`);
      whyFlagged.push(`Registered domain '${hostname}' belongs to an unverified third party.`);
    }

    if (features.has_login_keyword || features.has_verify_keyword) {
      whyFlagged.push('Login or account verification language detected alongside unauthorized brand presence.');
    }
    if (features.is_ip_address) {
      whyFlagged.push('Hostname is an IP address rather than a secure enterprise domain.');
    }
    if (features.num_hyphens >= 2) {
      whyFlagged.push(`Excessive hyphenation (${features.num_hyphens} hyphens) commonly used in deceptive domain spoofing.`);
    }
    if (features.suspicious_tld_flag) {
      whyFlagged.push(`Domain uses high-abuse Top-Level Domain (TLD .${features.tld}) frequently leveraged by phishing kits.`);
    }
    if (!features.is_https) {
      whyFlagged.push('Missing HTTPS encryption. Legitimate corporate and financial portals always enforce TLS/SSL.');
    }

    // Estimate Attack Goal
    let attackGoal = 'Informational / Standard Navigation';
    if (status === 'POTENTIAL_IMPERSONATION' || status === 'TYPOSQUATTING_DETECTED') {
      if (features.has_banking_keyword || matchedBrand.category === 'Banking' || features.has_payment_keyword) {
        attackGoal = 'Credential Harvesting & Unauthorized Financial Fund Theft';
      } else if (features.has_login_keyword || features.has_account_keyword) {
        attackGoal = 'Corporate / Personal Account Credential Theft';
      } else if (features.has_verify_keyword) {
        attackGoal = 'Two-Factor Authentication (OTP / 2FA) Interception';
      } else {
        attackGoal = 'Brand Impersonation & Social Engineering Trust Exploitation';
      }
    } else if (features.is_ip_address) {
      attackGoal = 'Unauthenticated Infrastructure / Direct Payload Delivery';
    }

    const domainRating = isOfficial
      ? 'VERIFIED'
      : (isTyposquat || features.is_ip_address ? 'MALICIOUS_ANOMALY' : 'SUSPICIOUS');

    return {
      claimed_identity: matchedBrand.name,
      brand_entity: matchedBrand,
      impersonation_status: status,
      impersonation_detected: status === 'POTENTIAL_IMPERSONATION' || status === 'TYPOSQUATTING_DETECTED',
      confidence_score: isOfficial ? 98 : (isTyposquat ? 92 : 88),
      brand_similarity_score: highestSimilarity,
      official_domains: matchedBrand.official_domains,
      attack_goal: attackGoal,
      trust_signals: {
        is_official_domain: isOfficial,
        domain_structure_rating: domainRating,
        brand_keyword_abuse: !isOfficial && (matchReason === 'brand_keyword_in_host' || matchReason === 'brand_in_context_or_path'),
        lookalike_detected: isTyposquat,
        ssl_presence: features.is_https,
        tld_reputation: features.suspicious_tld_flag ? 'SUSPICIOUS_HIGH_RISK' : (isOfficial ? 'TRUSTED' : 'STANDARD')
      },
      why_flagged: whyFlagged,
      verdict_summary: isOfficial
        ? `Verified official domain for ${matchedBrand.name}. Matches corporate trust registry.`
        : `Potential impersonation of ${matchedBrand.name}. Official communications only originate from [${matchedBrand.official_domains.join(', ')}].`
    };
  }
}

export const cyberTrustEngine = new CyberTrustEngine();
