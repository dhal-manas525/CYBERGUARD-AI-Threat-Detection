import type {
  AuthResponse,
  DashboardStats,
  ReportResponse,
  ScanListItem,
  ScanResponse,
  User,
  ImpersonationResponse,
  AuthEvent,
  AuthAnomalyResponse,
  IncidentItem,
  IncidentStatus,
  ChatMessage,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cyberguard_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function formatErrorDetail(err: any, fallback: string): string {
  if (!err) return fallback;
  if (typeof err.detail === 'string') return err.detail;
  if (Array.isArray(err.detail)) {
    return err.detail.map((d: any) => (d.msg ? d.msg.replace('Value error, ', '') : JSON.stringify(d))).join('. ');
  }
  if (err.message) return err.message;
  return fallback;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('cyberguard_token', data.access_token);
    localStorage.setItem('cyberguard_user', JSON.stringify(data.user));
    return data;
  },

  async register(name: string, email: string, password: string, confirm_password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirm_password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('cyberguard_token', data.access_token);
    localStorage.setItem('cyberguard_user', JSON.stringify(data.user));
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('cyberguard_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      localStorage.removeItem('cyberguard_token');
      localStorage.removeItem('cyberguard_user');
      return null;
    }
    return res.json();
  },

  logout() {
    localStorage.removeItem('cyberguard_token');
    localStorage.removeItem('cyberguard_user');
  },

  // Scans (Scenario A)
  async scanUrl(url: string): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/analyze/url`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unable to analyze this URL right now.' }));
      throw new Error(formatErrorDetail(err, 'Unable to analyze this URL. Please verify the URL format.'));
    }
    return res.json();
  },

  async scanEmail(sender: string, subject: string, body: string, links: string[] = []): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/analyze/email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sender, subject, body, links }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unable to analyze this email right now.' }));
      throw new Error(formatErrorDetail(err, 'Unable to analyze this email. Please check sender and content.'));
    }
    return res.json();
  },

  async scanMessage(content: string, platform: string = 'Generic / SMS'): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/analyze/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, platform }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unable to analyze this message right now.' }));
      throw new Error(formatErrorDetail(err, 'Unable to analyze this message. Content is too short or invalid.'));
    }
    return res.json();
  },

  async scanWebsite(url: string): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/analyze/website`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unable to inspect this website right now.' }));
      throw new Error(formatErrorDetail(err, 'Unable to inspect this website. Please provide a valid domain.'));
    }
    return res.json();
  },

  // Scenario B: Digital Impersonation
  async scanImpersonation(
    claimed_organization: string,
    target: string,
    auto_create_incident: boolean = true
  ): Promise<ImpersonationResponse> {
    const res = await fetch(`${API_BASE}/analyze/impersonation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ claimed_organization, target, auto_create_incident }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Impersonation verification failed.' }));
      throw new Error(formatErrorDetail(err, 'Impersonation verification failed. Please check inputs.'));
    }
    return res.json();
  },

  // Scenario C: Authentication Event Anomaly Detector
  async scanAuthEvents(
    events: AuthEvent[],
    auto_create_incident: boolean = true
  ): Promise<AuthAnomalyResponse> {
    const res = await fetch(`${API_BASE}/analyze/auth-events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ events, auto_create_incident }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Telemetry anomaly inspection failed.' }));
      throw new Error(formatErrorDetail(err, 'Telemetry anomaly inspection failed. Please verify events.'));
    }
    return res.json();
  },

  async getAuthDemoScenarios(): Promise<Record<string, AuthEvent[]>> {
    const res = await fetch(`${API_BASE}/analyze/auth-events/scenarios`);
    if (!res.ok) throw new Error('Failed to load demo auth telemetry scenarios');
    return res.json();
  },

  // Incident Lifecycle Management
  async getIncidents(status?: string, scenario_type?: string): Promise<IncidentItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (scenario_type) params.append('scenario_type', scenario_type);

    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch security incidents');
    return res.json();
  },

  async getIncidentDetails(incidentId: string): Promise<IncidentItem> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async updateIncidentStatus(
    incidentId: string,
    status?: IncidentStatus,
    notes?: string,
    assigned_to?: string
  ): Promise<IncidentItem> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes, assigned_to }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update incident status.' }));
      throw new Error(err.detail || 'Failed to update incident status');
    }
    return res.json();
  },

  async deleteIncident(incidentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete incident');
  },

  // Conversational AI Cybersecurity Assistant
  async chatAssistant(
    messages: { role: string; content: string }[],
    scan_context?: any
  ): Promise<{ reply: string; model_used: string }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messages, scan_context }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Assistant failed to respond.' }));
      throw new Error(err.detail || 'Assistant failed to respond');
    }
    return res.json();
  },

  // History & Scans
  async getScans(filters?: { scan_type?: string; threat_level?: string; search?: string }): Promise<ScanListItem[]> {
    const params = new URLSearchParams();
    if (filters?.scan_type) params.append('scan_type', filters.scan_type);
    if (filters?.threat_level) params.append('threat_level', filters.threat_level);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/scans?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load scan history');
    return res.json();
  },

  async getScanDetails(id: number): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/scans/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Scan record not found');
    return res.json();
  },

  async deleteScan(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/scans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete scan');
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve dashboard statistics');
    return res.json();
  },

  // Reports & Exports
  async generateReport(scanId: number): Promise<ReportResponse> {
    const res = await fetch(`${API_BASE}/reports/${scanId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate threat report');
    return res.json();
  },

  async exportReport(scanId: number, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const res = await fetch(`${API_BASE}/reports/${scanId}/export?format=${format}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to export report');
    return res.blob();
  },

  // Health
  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend unavailable');
    return res.json();
  }
};
