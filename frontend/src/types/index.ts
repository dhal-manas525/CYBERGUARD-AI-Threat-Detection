export type ThreatLevel = 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
export type ScanType = 'url' | 'email' | 'message' | 'website' | 'impersonation' | 'auth_anomaly';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CyberTrustIntelligence {
  claimed_identity: string;
  identity_match_status: 'MATCH' | 'MISMATCH' | 'LOOKALIKE_DETECTED' | 'UNKNOWN';
  is_impersonation: boolean;
  impersonated_brand?: string | null;
  official_domain?: string | null;
  why_flagged: string[];
  possible_attack_goal: string;
  recommended_actions: string[];
  trust_breakdown: {
    url_structure_risk?: number;
    identity_trust_score?: number;
    content_signals_risk?: number;
    ml_model_confidence?: number;
    sender_authenticity_risk?: number;
    social_engineering_score?: number;
    financial_urgency_score?: number;
    external_threat_intel: string;
    [key: string]: any;
  };
}

export interface ScanResponse {
  id?: number;
  target: string;
  scan_type: ScanType;
  risk_score: number;
  threat_level: ThreatLevel;
  threat_category: string;
  ml_prediction: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  ml_confidence: number;
  cybertrust: CyberTrustIntelligence;
  extracted_features: Record<string, any>;
  created_at: string;
  is_demo?: boolean;
}

export interface ScanListItem {
  id: number;
  target: string;
  scan_type: ScanType;
  risk_score: number;
  threat_level: ThreatLevel;
  threat_category: string;
  claimed_identity: string;
  impersonation_detected: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_scans: number;
  threats_detected: number;
  critical_threats: number;
  average_risk_score: number;
  threat_distribution: { name: string; value: number; color: string }[];
  recent_scans: ScanListItem[];
  category_breakdown: { category: string; count: number }[];
  risk_trend: { date: string; average_risk: number; threat?: string; scans?: number }[];
}

export interface ReportResponse {
  report_id: string;
  generated_at: string;
  generator_system: string;
  scan_data: ScanResponse;
  executive_summary: string;
  mitigation_steps: string[];
}

// =========================================================================
// SCENARIO B: Digital Impersonation Types
// =========================================================================
export interface HomoglyphDetail {
  character: string;
  substitutes_for: string;
  explanation: string;
}

export interface ImpersonationResponse {
  claimed_organization: string;
  target_destination: string;
  target_host: string;
  official_domains: string[];
  match_status: 'EXACT_MATCH' | 'LOOKALIKE_IMPERSONATION' | 'MISMATCH_UNAUTHORIZED';
  impersonation_detected: boolean;
  similarity_score: number;
  risk_score: number;
  threat_level: ThreatLevel;
  threat_category: string;
  homoglyphs_detected: HomoglyphDetail[];
  evidentiary_breakdown: string[];
  threat_objective: string;
  recommended_actions: string[];
  confidence: number;
  incident_id?: string | null;
}

// =========================================================================
// SCENARIO C: Authentication Anomaly Types
// =========================================================================
export interface AuthEvent {
  timestamp: string;
  username: string;
  ip_address: string;
  location?: string;
  status: 'SUCCESS' | 'FAILURE' | string;
  user_agent?: string;
}

export interface AnomalyItem {
  type: string;
  severity: 'HIGH' | 'CRITICAL' | 'SUSPICIOUS' | string;
  title: string;
  affected_account: string;
  offending_ip: string;
  event_count: number;
  description: string;
  timestamp: string;
}

export interface AuthAnomalyResponse {
  total_events: number;
  anomaly_score: number;
  threat_level: ThreatLevel;
  threat_category: string;
  anomalies_detected: AnomalyItem[];
  affected_accounts: string[];
  offending_ips: string[];
  attack_vectors: string[];
  summary: string;
  recommended_response: string[];
  analyzed_at: string;
  incident_id?: string | null;
}

// =========================================================================
// INCIDENT MANAGEMENT TYPES
// =========================================================================
export type IncidentStatus = 'New' | 'Investigating' | 'Mitigated' | 'Closed';

export interface IncidentItem {
  id: number;
  incident_id: string;
  title: string;
  threat_level: ThreatLevel;
  scenario_type: string;
  target: string;
  risk_score: number;
  status: IncidentStatus;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  details?: Record<string, any>;
}

// =========================================================================
// ASSISTANT CHAT TYPES
// =========================================================================
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  model_used?: string;
}
