/**
 * CYBERGUARD - Python Export Service
 * Provides production-ready standalone Python code for scikit-learn & feature extraction
 */

export const PYTHON_FEATURE_EXTRACTOR = `"""
CYBERGUARD - URL Feature Extraction Module
Stand-alone, reusable Python module for feature engineering.
"""
import math
import re
from urllib.parse import urlparse
from typing import Dict, Any, List

SUSPICIOUS_TLDS = {
    'tk', 'ml', 'ga', 'cf', 'gq', 'top', 'xyz', 'icu', 'buzz',
    'cam', 'click', 'rest', 'work', 'fit', 'club', 'monster',
    'sbs', 'quest', 'boats', 'cfd', 'kim', 'vip', 'bond', 'mom'
}

KEYWORD_GROUPS = {
    'login': ['login', 'signin', 'sign-in', 'log-in', 'auth', 'sso', 'portal'],
    'verify': ['verify', 'verification', 'confirm', 'validate', 'kyc', 'unlock'],
    'banking': ['bank', 'banking', 'netbank', 'yono', 'inb', 'chase', 'sbi', 'wire'],
    'account': ['account', 'myaccount', 'profile', 'billing', 'wallet', 'suspension'],
    'payment': ['payment', 'pay', 'checkout', 'invoice', 'creditcard', 'crypto'],
    'security': ['security', 'secure', 'guard', 'protect', 'firewall', 'checkpoint']
}

def calculate_shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    frequencies = {}
    for char in text:
        frequencies[char] = frequencies.get(char, 0) + 1
    entropy = 0.0
    length = len(text)
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 3)

def is_ip_address(hostname: str) -> bool:
    ipv4_pattern = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    return bool(re.match(ipv4_pattern, hostname))

def extract_features(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    if not re.match(r'^https?://', url, re.IGNORECASE):
        url = 'http://' + url

    parsed = urlparse(url)
    hostname = parsed.hostname or ''
    path = parsed.path or ''
    query = parsed.query or ''

    domain_parts = hostname.split('.')
    tld = domain_parts[-1] if len(domain_parts) > 1 else ''

    num_digits = len(re.findall(r'\\d', url))
    special_chars = len(re.findall(r'[^a-zA-Z0-9]', url))
    url_len = max(1, len(url))

    matched_keywords = []
    url_lower = url.lower()
    for group_name, kws in KEYWORD_GROUPS.items():
        for kw in kws:
            if kw in url_lower and kw not in matched_keywords:
                matched_keywords.append(kw)

    return {
        'url_length': len(url),
        'domain_length': len(hostname),
        'path_length': len(path),
        'query_length': len(query),
        'num_dots': url.count('.'),
        'num_subdomains': max(0, len(domain_parts) - 2),
        'num_hyphens': url.count('-'),
        'num_digits': num_digits,
        'digit_ratio': round(num_digits / url_len, 3),
        'special_char_ratio': round(special_chars / url_len, 3),
        'num_at_symbols': url.count('@'),
        'num_percent_encoded': len(re.findall(r'%[0-9a-fA-F]{2}', url)),
        'is_https': 1 if url.lower().startswith('https://') else 0,
        'is_ip_address': 1 if is_ip_address(hostname) else 0,
        'domain_entropy': calculate_shannon_entropy(hostname.replace('.', '')),
        'suspicious_tld_flag': 1 if tld.lower() in SUSPICIOUS_TLDS else 0,
        'suspicious_keyword_count': len(matched_keywords)
    }

if __name__ == '__main__':
    test_sample = "https://sbi-secure-login-example.com/verify"
    features = extract_features(test_sample)
    print("Extracted Features for:", test_sample)
    for k, v in features.items():
        print(f"  {k}: {v}")
`;

export const PYTHON_TRAIN_SCRIPT = `"""
CYBERGUARD - ML Model Training & Evaluation Pipeline
Uses scikit-learn to train Random Forest & Gradient Boosting baseline models
for phishing URL classification.
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import StandardScaler
import joblib

# Synthetic sample dataset generation (replace with your Kaggle/ISCX-URL CSV)
def generate_sample_dataset(n_samples=2000):
    np.random.seed(42)
    # 0: Safe, 1: Suspicious, 2: Malicious
    y = np.random.choice([0, 1, 2], size=n_samples, p=[0.5, 0.2, 0.3])
    
    # Feature matrix corresponding to extracted features
    X = np.zeros((n_samples, 12))
    for i in range(n_samples):
        if y[i] == 0:  # Safe
            X[i] = [
                np.random.normal(35, 10),      # url_length
                np.random.normal(12, 3),       # domain_length
                np.random.poisson(1.5),        # num_dots
                np.random.poisson(0.3),        # num_subdomains
                np.random.poisson(0.4),        # num_hyphens
                0.05,                          # digit_ratio
                0,                             # num_at_symbols
                1,                             # is_https
                0,                             # is_ip_address
                np.random.normal(2.5, 0.4),    # domain_entropy
                0,                             # suspicious_tld_flag
                0                              # suspicious_keyword_count
            ]
        elif y[i] == 1: # Suspicious
            X[i] = [
                np.random.normal(65, 15),
                np.random.normal(20, 5),
                np.random.poisson(3.0),
                np.random.poisson(1.8),
                np.random.poisson(2.0),
                0.15,
                0,
                np.random.choice([0, 1]),
                0,
                np.random.normal(3.4, 0.5),
                np.random.choice([0, 1], p=[0.7, 0.3]),
                np.random.poisson(1.0)
            ]
        else: # Malicious (Phishing)
            X[i] = [
                np.random.normal(90, 25),
                np.random.normal(28, 8),
                np.random.poisson(4.5),
                np.random.poisson(2.5),
                np.random.poisson(3.2),
                0.28,
                np.random.choice([0, 1], p=[0.8, 0.2]),
                np.random.choice([0, 1], p=[0.4, 0.6]),
                np.random.choice([0, 1], p=[0.75, 0.25]),
                np.random.normal(4.1, 0.4),
                np.random.choice([0, 1], p=[0.4, 0.6]),
                np.random.poisson(2.4)
            ]
            
    feature_names = [
        'url_length', 'domain_length', 'num_dots', 'num_subdomains',
        'num_hyphens', 'digit_ratio', 'num_at_symbols', 'is_https',
        'is_ip_address', 'domain_entropy', 'suspicious_tld_flag',
        'suspicious_keyword_count'
    ]
    return pd.DataFrame(X, columns=feature_names), y

def train_and_evaluate():
    print("[*] Generating / Loading CyberGuard Training Dataset...")
    X, y = generate_sample_dataset(n_samples=5000)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("[*] Training GradientBoostingClassifier...")
    model = GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42)
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    
    print("\\n=== CLASSIFICATION REPORT ===")
    target_names = ['SAFE', 'SUSPICIOUS', 'MALICIOUS']
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    print("\\n=== CONFUSION MATRIX ===")
    print(confusion_matrix(y_test, y_pred))
    
    print("\\n=== FEATURE IMPORTANCES ===")
    for name, imp in sorted(zip(X.columns, model.feature_importances_), key=lambda x: x[1], reverse=True):
        print(f"  {name:25s}: {imp:.4f}")
        
    # Serialize model artifact
    joblib.dump(model, 'cyberguard_model.joblib')
    print("\\n[+] Model successfully serialized to 'cyberguard_model.joblib'")

if __name__ == '__main__':
    train_and_evaluate()
`;
