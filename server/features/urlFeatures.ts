/**
 * CYBERGUARD - URL Feature Extraction Engine
 * Extracts structural, lexical, host, and behavioral indicators from candidate URLs.
 * Reusable across ML inference and Rule Engine.
 */

export interface URLFeatureVector {
  // Length metrics
  url_length: number;
  domain_length: number;
  path_length: number;
  query_length: number;

  // Structural & Lexical counts
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

  // Host properties
  is_https: boolean;
  is_ip_address: boolean;
  has_punycode: boolean;
  domain_entropy: number;
  suspicious_tld_flag: boolean;
  tld: string;

  // Keyword flags & counts
  has_login_keyword: boolean;
  has_verify_keyword: boolean;
  has_banking_keyword: boolean;
  has_account_keyword: boolean;
  has_payment_keyword: boolean;
  has_security_keyword: boolean;
  suspicious_keyword_count: number;
  matched_keywords: string[];

  // Domain structure & tokens
  subdomain_part: string;
  domain_registered: string;
  path_part: string;
}

const SUSPICIOUS_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'top', 'xyz', 'icu', 'buzz',
  'cam', 'click', 'rest', 'work', 'fit', 'club', 'monster',
  'sbs', 'quest', 'boats', 'cfd', 'kim', 'vip', 'bond', 'mom'
]);

const KEYWORD_GROUPS = {
  login: ['login', 'signin', 'sign-in', 'log-in', 'auth', 'authenticate', 'sso', 'portal'],
  verify: ['verify', 'verification', 'confirm', 'confirmation', 'validate', 'kyc', 'reactivate', 'unlock'],
  banking: ['bank', 'banking', 'netbank', 'yono', 'inb', 'chase', 'sbi', 'wire', 'swift', 'routing'],
  account: ['account', 'myaccount', 'profile', 'billing', 'wallet', 'security-alert', 'suspension', 'blocked'],
  payment: ['payment', 'pay', 'checkout', 'invoice', 'creditcard', 'card', 'crypto', 'refund', 'transaction'],
  security: ['security', 'secure', 'guard', 'protect', 'firewall', 'antivirus', 'safety', 'checkpoint']
};

/**
 * Calculates Shannon entropy of a string (measures randomness/algorithmic generation)
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Checks whether a given hostname is an IP address (IPv4, IPv6, or obfuscated)
 */
export function isIpAddress(hostname: string): boolean {
  // IPv4 standard: e.g. 192.168.1.1
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(hostname)) return true;

  // Hexadecimal IP (e.g. 0x7f000001) or Decimal IP (e.g. 2130706433)
  if (/^0x[0-9a-fA-F]+$/i.test(hostname) || /^\d{8,11}$/.test(hostname)) return true;

  // IPv6
  if (hostname.includes(':') && (hostname.startsWith('[') || hostname.split(':').length >= 3)) return true;

  return false;
}

/**
 * Normalizes input URL strings safely
 */
export function parseURLSafe(input: string): { urlObj: URL | null; raw: string; error?: string } {
  let trimmed = input.trim();
  if (!trimmed) {
    return { urlObj: null, raw: input, error: 'Empty URL provided' };
  }

  // Prepend scheme if missing so URL constructor can parse
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'http://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return { urlObj: parsed, raw: trimmed };
  } catch (err) {
    return { urlObj: null, raw: input, error: 'Malformed URL structure' };
  }
}

/**
 * Extracts normalized feature vector from a URL string
 */
export function extractURLFeatures(rawInput: string): URLFeatureVector {
  const { urlObj, raw } = parseURLSafe(rawInput);

  const fallbackDomain = raw.split('/')[2] || raw.split('/')[0] || raw;
  const hostname = urlObj ? urlObj.hostname.toLowerCase() : fallbackDomain.toLowerCase();
  const pathname = urlObj ? urlObj.pathname : '';
  const search = urlObj ? urlObj.search : '';

  // Domain token decomposition
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const domainRegistered = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : hostname;
  const subdomainPart = domainParts.length > 2 ? domainParts.slice(0, -2).join('.') : '';

  // Length calculations
  const url_length = raw.length;
  const domain_length = hostname.length;
  const path_length = pathname.length;
  const query_length = search.length;

  // Punctuation counts
  const num_dots = (raw.match(/\./g) || []).length;
  const num_subdomains = Math.max(0, domainParts.length - 2);
  const num_hyphens = (raw.match(/-/g) || []).length;
  const num_underscores = (raw.match(/_/g) || []).length;
  const num_slashes = (raw.match(/\//g) || []).length;
  const num_question_marks = (raw.match(/\?/g) || []).length;
  const num_equal_signs = (raw.match(/=/g) || []).length;
  const num_at_symbols = (raw.match(/@/g) || []).length;
  const num_percent_encoded = (raw.match(/%[0-9a-fA-F]{2}/g) || []).length;

  const num_digits = (raw.match(/\d/g) || []).length;
  const digit_ratio = Number((num_digits / Math.max(1, url_length)).toFixed(3));
  const specialChars = (raw.match(/[^a-zA-Z0-9]/g) || []).length;
  const special_char_ratio = Number((specialChars / Math.max(1, url_length)).toFixed(3));

  // Host properties
  const is_https = raw.toLowerCase().startsWith('https://');
  const is_ip = isIpAddress(hostname);
  const has_punycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
  const domain_entropy = calculateShannonEntropy(hostname.replace(/\./g, ''));
  const suspicious_tld_flag = SUSPICIOUS_TLDS.has(tld.toLowerCase());

  // Keyword extraction
  const lowerRaw = raw.toLowerCase();
  const matchedKeywords: string[] = [];

  const checkGroup = (keywords: string[]): boolean => {
    let found = false;
    for (const kw of keywords) {
      if (lowerRaw.includes(kw)) {
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        found = true;
      }
    }
    return found;
  };

  const has_login_keyword = checkGroup(KEYWORD_GROUPS.login);
  const has_verify_keyword = checkGroup(KEYWORD_GROUPS.verify);
  const has_banking_keyword = checkGroup(KEYWORD_GROUPS.banking);
  const has_account_keyword = checkGroup(KEYWORD_GROUPS.account);
  const has_payment_keyword = checkGroup(KEYWORD_GROUPS.payment);
  const has_security_keyword = checkGroup(KEYWORD_GROUPS.security);

  return {
    url_length,
    domain_length,
    path_length,
    query_length,
    num_dots,
    num_subdomains,
    num_hyphens,
    num_underscores,
    num_slashes,
    num_question_marks,
    num_equal_signs,
    num_at_symbols,
    num_percent_encoded,
    num_digits,
    digit_ratio,
    special_char_ratio,
    is_https,
    is_ip_address: is_ip,
    has_punycode,
    domain_entropy,
    suspicious_tld_flag,
    tld,
    has_login_keyword,
    has_verify_keyword,
    has_banking_keyword,
    has_account_keyword,
    has_payment_keyword,
    has_security_keyword,
    suspicious_keyword_count: matchedKeywords.length,
    matched_keywords: matchedKeywords,
    subdomain_part: subdomainPart,
    domain_registered: domainRegistered,
    path_part: pathname
  };
}
