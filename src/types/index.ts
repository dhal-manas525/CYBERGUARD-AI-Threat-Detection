export interface URLFeatureVector {
  url_length: number;
  domain_length: number;
  path_length: number;
  query_length: number;
  num_dots: number;
  num_subdomains: number;
  num_hyphens: number;
  num_underscores: number;
  num_slashes: number;
  num_question_marks: number;
  num_equal_signs: number;
  num_at_symbols: number;
  num_percent_encoded: number;
  num_digits: number;
  digit_ratio: number;
  special_char_ratio: number;
  is_https: boolean;
  is_ip_address: boolean;
  has_punycode: boolean;
  domain_entropy: number;
  suspicious_tld_flag: boolean;
  tld: string;
  has_login_keyword: boolean;
  has_verify_keyword: boolean;
  has_banking_keyword: boolean;
  has_account_keyword: boolean;
  has_payment_keyword: boolean;
  has_security_keyword: boolean;
  suspicious_keyword_count: number;
  matched_keywords: string[];
  subdomain_part: string;
  domain_registered: string;
  path_part: string;
}

export type ImpersonationStatus =
  | 'OFFICIAL_VERIFIED'
  | 'OFFICIAL_SUBDOMAIN'
  | 'POTENTIAL_IMPERSONATION'
  | 'TYPOSQUATTING_DETECTED'
  | 'UNRELATED_ORGANIZATION'
  | 'NO_CLAIMED_IDENTITY';

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

export interface CyberTrustAnalysis {
  claimed_identity: string | null;
  brand_entity: BrandEntity | null;
  impersonation_status: ImpersonationStatus;
  impersonation_detected: boolean;
  confidence_score: number;
  brand_similarity_score: number;
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

export interface MLInferenceResult {
  predicted_class: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  probabilities: {
    safe: number;
    suspicious: number;
    malicious: number;
  };
  model_confidence: number;
  model_type: string;
  top_contributing_features: Array<{
    feature: string;
    value: number | string | boolean;
    importance_weight: number;
    direction: 'RISK_INCREASING' | 'SAFETY_INCREASING';
    explanation: string;
  }>;
}

export interface RiskIndicatorSignal {
  indicator: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  points: number;
  explanation: string;
}

export interface AIExplanationResult {
  executive_summary: string;
  threat_narrative: string;
  attacker_intent_breakdown: string;
  plain_english_action_guide: string;
  llm_used: boolean;
  model_name: string;
}

export interface ScanResultPayload {
  scan_id: string;
  target?: string;
  risk_score: number;
  risk_level: 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
  threat_type: string;
  model_confidence: number;
  score_breakdown?: {
    ml_contribution: number;
    cybertrust_contribution: number;
    heuristics_contribution: number;
    nlp_contribution: number;
  };
  cybertrust: CyberTrustAnalysis;
  ml_result?: MLInferenceResult;
  signals: RiskIndicatorSignal[];
  features?: URLFeatureVector;
  attack_goal?: string;
  explanation: AIExplanationResult;
  recommendations: string[];
  limitations: string[];
  created_at?: string;
  probe_results?: any;
  nlp_analysis?: any;
}

export interface ScanRecordItem {
  id: string;
  target: string;
  scan_type: 'URL' | 'EMAIL' | 'MESSAGE' | 'WEBSITE';
  risk_score: number;
  risk_level: string;
  threat_type: string;
  claimed_identity: string | null;
  impersonation_detected: boolean;
  attack_goal: string;
  created_at: string;
}

export interface DashboardStatsData {
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
