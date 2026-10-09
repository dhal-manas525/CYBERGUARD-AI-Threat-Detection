/**
 * CYBERGUARD Frontend Validation Utilities
 * Enforces pre-flight lexical validation across all scanners.
 * Prevents submitting invalid gibberish (e.g. 'jbhiuoihgiepghi') and provides friendly guidance.
 */

// Basic IPv4 pattern
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

// Email standard pattern
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

// Domain label pattern
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUrlInput(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Please enter a URL or domain name to analyze.' };
  }

  const val = input.trim();

  if (val.length < 3) {
    return { isValid: false, error: 'Target input is too short to be a valid URL or domain.' };
  }

  if (val.includes(' ') || val.includes('\t') || val.includes('\n')) {
    return { isValid: false, error: 'URLs and domain names cannot contain spaces.' };
  }

  // Extract hostname
  let host = val;
  if (host.includes('://')) {
    host = host.split('://')[1];
  } else if (host.startsWith('//')) {
    host = host.slice(2);
  }

  // Strip path, query, port, credentials
  if (host.includes('/')) {
    host = host.split('/')[0];
  }
  if (host.includes('?')) {
    host = host.split('?')[0];
  }
  if (host.includes('#')) {
    host = host.split('#')[0];
  }
  if (host.includes('@')) {
    host = host.split('@')[1];
  }
  if (host.includes(':')) {
    host = host.split(':')[0];
  }

  host = host.trim().toLowerCase();

  if (!host) {
    return { isValid: false, error: 'No valid host or domain found in the input.' };
  }

  // Allow IPv4 address (e.g. 185.220.101.5)
  if (IPV4_REGEX.test(host)) {
    const octets = host.split('.').map(Number);
    const validOctets = octets.every((o) => o >= 0 && o <= 255);
    if (!validOctets) {
      return { isValid: false, error: 'IP address octets must be between 0 and 255.' };
    }
    return { isValid: true };
  }

  // Allow localhost for dev testing
  if (host === 'localhost') {
    return { isValid: true };
  }

  // A valid domain must contain at least one dot
  // Rejects unbroken gibberish like 'jbhiuoihgiepghi' or 'teststring'
  if (!host.includes('.')) {
    return {
      isValid: false,
      error: `'${val}' is not a valid URL or domain. A valid domain must include a domain extension (e.g. '.com', '.org', '.net', '.in'). Example: 'paypal-security.com' or 'https://bank.co.in'.`
    };
  }

  const labels = host.split('.');
  if (labels.length < 2) {
    return { isValid: false, error: 'Domain must contain a name and extension (e.g. example.com).' };
  }

  for (const label of labels) {
    if (!label) {
      return { isValid: false, error: 'Domain cannot contain consecutive dots or empty labels.' };
    }
    if (label.startsWith('xn--')) {
      continue; // Punycode IDN support
    }
    if (!DOMAIN_LABEL_REGEX.test(label)) {
      return {
        isValid: false,
        error: `Domain segment '${label}' contains invalid characters. Use letters, numbers, and hyphens.`
      };
    }
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2) {
    return { isValid: false, error: `Domain extension '.${tld}' is invalid. Extensions must have at least 2 letters.` };
  }
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: `Domain extension '.${tld}' cannot contain numbers or symbols.` };
  }

  return { isValid: true };
}

export function validateEmailInput(sender: string, subject: string, body: string): ValidationResult {
  const cleanSender = sender.trim();
  if (!cleanSender) {
    return { isValid: false, error: 'Please provide the sender email address.' };
  }

  let emailToCheck = cleanSender;
  if (cleanSender.includes('<') && cleanSender.includes('>')) {
    const match = cleanSender.match(/<([^>]+)>/);
    if (match) emailToCheck = match[1].trim();
  }

  if (!EMAIL_REGEX.test(emailToCheck)) {
    return {
      isValid: false,
      error: `'${cleanSender}' is not a valid email address. Expected format: 'security@organization.com'.`
    };
  }

  const cleanSubj = subject.trim();
  const cleanBody = body.trim();
  if (cleanSubj.length < 3 && cleanBody.length < 5) {
    return {
      isValid: false,
      error: 'Please provide meaningful email subject or body text (at least 5 characters) to analyze.'
    };
  }

  return { isValid: true };
}

export function validateMessageInput(content: string): ValidationResult {
  const clean = content.trim();
  if (!clean) {
    return { isValid: false, error: 'Please enter the message or SMS text to inspect.' };
  }

  if (clean.length < 8) {
    return {
      isValid: false,
      error: 'Message content is too short for threat analysis. Please enter at least 8 characters.'
    };
  }

  if (!clean.includes(' ') && clean.length > 25 && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Message appears to be an unbroken random string without words. Please enter realistic message content.'
    };
  }

  return { isValid: true };
}

export function validateImpersonationInput(claimedOrg: string, target: string): ValidationResult {
  const cleanOrg = claimedOrg.trim();
  if (!cleanOrg || cleanOrg.length < 2) {
    return { isValid: false, error: 'Please enter a valid claimed organization name (e.g. State Bank of India, PayPal).' };
  }

  const cleanTarget = target.trim();
  if (!cleanTarget) {
    return { isValid: false, error: 'Please provide the target URL, domain, or sender email to verify.' };
  }

  if (cleanTarget.includes('@')) {
    let email = cleanTarget;
    if (email.includes('<') && email.includes('>')) {
      const match = email.match(/<([^>]+)>/);
      if (match) email = match[1].trim();
    }
    if (!EMAIL_REGEX.test(email)) {
      return { isValid: false, error: `'${cleanTarget}' is not a valid sender email address.` };
    }
    return { isValid: true };
  }

  return validateUrlInput(cleanTarget);
}
