export interface DemoSample {
  id: string;
  title: string;
  description: string;
  category: 'Safe' | 'Suspicious' | 'Brand Impersonation' | 'Phishing Email' | 'Scam Message';
  type: 'url' | 'email' | 'message';
  payload: {
    url?: string;
    sender?: string;
    subject?: string;
    body?: string;
    content?: string;
    platform?: string;
  };
}

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'demo-sbi-phish',
    title: 'Brand Impersonation Phishing',
    description: 'Deceptive lookalike domain targeting State Bank of India net banking users',
    category: 'Brand Impersonation',
    type: 'url',
    payload: {
      url: 'http://onlinesbi-kyc-verification-portal.com/login.php',
    },
  },
  {
    id: 'demo-paypal-alert',
    title: 'High-Risk Payment Phish',
    description: 'Suspicious TLD with login hooks impersonating PayPal billing',
    category: 'Brand Impersonation',
    type: 'url',
    payload: {
      url: 'http://paypal-account-security-alert-center.top/signin',
    },
  },
  {
    id: 'demo-safe-microsoft',
    title: 'Verified Official Domain',
    description: 'Official enterprise domain with verified TLS and clean structural metrics',
    category: 'Safe',
    type: 'url',
    payload: {
      url: 'https://www.microsoft.com/en-us/microsoft-365',
    },
  },
  {
    id: 'demo-suspicious-crypto',
    title: 'Suspicious Disposable Domain',
    description: 'High entropy disposable .xyz domain promising financial bonuses',
    category: 'Suspicious',
    type: 'url',
    payload: {
      url: 'http://free-crypto-rewards.xyz/claim-now?bonus=5000',
    },
  },
  {
    id: 'demo-phishing-email',
    title: 'Urgent Banking Phishing Email',
    description: 'Spoofed security notification demanding urgent KYC credential re-entry',
    category: 'Phishing Email',
    type: 'email',
    payload: {
      sender: 'security-alerts@onlinesbi-notice.com',
      subject: 'URGENT: Your NetBanking Access Will Be Terminated In 12 Hours',
      body: 'Dear Valued Customer,\n\nOur automated security scanner detected that your mandatory KYC details have expired. To prevent immediate permanent suspension of your internet banking account, you must confirm your credentials and card details immediately.\n\nPlease visit the secured verification portal:\nhttp://onlinesbi-kyc-verification-portal.com/login.php\n\nDo not ignore this notice.\n\nChief Security Division,\nState Bank of India',
    },
  },
  {
    id: 'demo-scam-sms',
    title: 'WhatsApp / SMS Electricity Scam',
    description: 'Coercive disconnection extortion message directing to fraudulent contact',
    category: 'Scam Message',
    type: 'message',
    payload: {
      platform: 'WhatsApp / SMS',
      content: 'Dear Customer, your electricity power connection will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Please immediately call our nodal officer at 9812345678 or share the 6-digit verification OTP to prevent disconnection.',
    },
  },
];
