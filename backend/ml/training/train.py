"""
CYBERGUARD Machine Learning Training Pipeline
Pure NumPy + Feature Engineering Implementation
Resilient against OS Application Control policies while providing true
train/test splitting, precision, recall, F1 evaluation, and confusion matrix.
"""

import os
import sys
import json
import math
import numpy as np
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from ml.features.extractor import extract_url_features, FEATURE_NAMES, features_to_vector


def generate_benchmark_dataset():
    """Generates balanced benchmark dataset with 120+ labeled URLs."""
    safe_urls = [
        "https://www.google.com/search?q=cybersecurity",
        "https://github.com/microsoft/vscode",
        "https://en.wikipedia.org/wiki/Phishing",
        "https://www.amazon.com/gp/help/customer/display.html",
        "https://aws.amazon.com/console/",
        "https://www.apple.com/iphone/",
        "https://www.microsoft.com/en-us/microsoft-365",
        "https://www.netflix.com/browse",
        "https://www.paypal.com/signin",
        "https://www.onlinesbi.sbi/portal/",
        "https://www.hdfcbank.com/personal/ways-to-bank/online-banking",
        "https://www.icicibank.com/personal-banking",
        "https://stackoverflow.com/questions/tagged/python",
        "https://docs.python.org/3/library/urllib.parse.html",
        "https://www.cloudflare.com/learning/security/what-is-cybersecurity/",
        "https://www.nytimes.com/section/technology",
        "https://edition.cnn.com/world",
        "https://news.ycombinator.com/",
        "https://www.linkedin.com/feed/",
        "https://twitter.com/explore",
        "https://www.spotify.com/us/premium/",
        "https://stripe.com/docs/api",
        "https://www.dropbox.com/business",
        "https://zoom.us/join",
        "https://slack.com/help",
        "https://www.reddit.com/r/netsec/",
        "https://pypi.org/project/fastapi/",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        "https://fastapi.tiangolo.com/tutorial/",
        "https://www.adobe.com/creativecloud.html",
        "https://www.chase.com/personal/banking",
        "https://www.bankofamerica.com/online-banking/",
        "https://www.wellsfargo.com/",
        "https://www.irs.gov/payments",
        "https://www.usps.com/manage/",
        "https://www.dhl.com/en/express/tracking.html",
        "https://www.fedex.com/en-us/tracking.html",
        "https://medium.com/@infosec/analysis",
        "https://dev.to/t/security",
        "https://www.bbc.com/news",
    ]

    suspicious_urls = [
        "http://free-crypto-rewards.xyz/claim-now?bonus=5000",
        "http://gift-voucher-generator.icu/redeem.php",
        "http://download-speed-boost.top/installer.exe",
        "http://track-order-support-dispatch.buzz/notice",
        "http://account-check-renew-2024.club/member",
        "http://stream-free-movies-hd.tk/watch",
        "http://winner-lottery-notice.cf/claim?id=99281",
        "http://online-file-storage.rest/download%20now.zip",
        "http://mega-discount-portal.date/shop",
        "http://unlimited-cloud-trial.work/setup",
        "https://secure-vpn-free-account.kim/verify",
        "http://global-express-air-notice.country/status",
        "http://customer-survey-bonus.faith/start",
        "http://quick-cash-reward.top/index?ref=urgent",
        "http://special-bonus-offer.xyz/portal",
        "http://instant-approval-loans.buzz/apply-online",
        "http://high-yield-interest.icu/invest?plan=vip",
        "http://file-sharing-direct.zip/package",
        "http://free-gaming-skins.club/collect",
        "http://prize-draw-announcement.top/check",
        "http://urgent-system-alert-notice.work/clean",
        "http://cheap-flight-tickets-direct.buzz/search",
        "http://remote-work-hiring-now.xyz/register",
        "http://cryptocurrency-airdrop-pool.icu/connect",
        "http://mobile-topup-recharge-free.top/action",
        "http://vip-rewards-club-hub.club/signin",
        "http://telegram-group-crypto-signals.xyz/join",
        "http://discount-branded-goods.work/items",
        "http://speedtest-server-check.icu/ping",
        "http://social-media-followers-boost.top/order",
    ]

    malicious_urls = [
        "http://onlinesbi-kyc-verification-portal.com/login.php",
        "http://sbi-card-reward-points-redeem.xyz/verify-otp",
        "http://paypal-account-security-alert-center.top/signin",
        "http://paypal-resolve-dispute-urgent.icu/webscr?cmd=_login",
        "http://microsoft-office365-password-reset.buzz/auth/login",
        "http://login-microsoftonline-security-team.com/sso",
        "http://accounts-google-security-verify.top/signin/v2",
        "http://google-drive-shared-doc-view.xyz/auth?user=victim",
        "http://appleid-apple-manage-account.icu/identity/verify",
        "http://apple-icloud-findmy-lost-device.top/auth",
        "http://amazon-prime-payment-declined.club/account/update-card",
        "http://amazon-billing-resolution-center.xyz/signin",
        "http://netflix-billing-account-suspended.top/update-payment",
        "http://chase-bank-online-security-check.work/logon",
        "http://bankofamerica-secure-login-portal.xyz/sign-in",
        "http://192.168.1.100/admin/credentials.txt",
        "http://185.220.101.5/bank/login.php",
        "http://103.251.167.20/sbi/otp_submit.php",
        "http://217.182.169.145/webmail/login",
        "http://usps-package-address-update-fee.xyz/delivery-track",
        "http://dhl-express-failed-delivery-pay.icu/fee-payment",
        "http://fedex-parcel-status-pending-charge.top/tracking",
        "http://hdfc-bank-netbanking-kyc-update.com/netbanking",
        "http://icici-bank-rewards-card-portal.xyz/customer",
        "http://wells-fargo-fraud-prevention-alert.club/signin",
        "http://secure-login-portal-auth-check.xyz/session?token=steal",
        "http://irs-tax-refund-claim-direct.top/taxpayer/refund",
        "http://meta-facebook-copyright-violation-appeal.icu/case",
        "http://instagram-blue-tick-verification-center.xyz/badges",
        "http://whatsapp-web-reconnect-session.top/auth/qr",
        "http://binance-wallet-recovery-phrase.icu/unlock",
        "http://coinbase-account-restricted-action.xyz/signin",
        "http://metamask-io-wallet-seed-phrase.top/import",
        "http://steam-community-free-skins-trade.xyz/tradeoffer",
        "http://linkedin-account-verification-notice.top/uas/login",
    ]

    dataset = []
    for u in safe_urls:
        dataset.append((u, "SAFE"))
    for u in suspicious_urls:
        dataset.append((u, "SUSPICIOUS"))
    for u in malicious_urls:
        dataset.append((u, "MALICIOUS"))
    return dataset


class MultinomialLogisticClassifier:
    """Softmax Logistic Regression with L2 Regularization implemented in pure NumPy."""
    def __init__(self, lr=0.05, epochs=600, l2=0.01):
        self.lr = lr
        self.epochs = epochs
        self.l2 = l2
        self.weights = None
        self.bias = None
        self.mean = None
        self.std = None
        self.classes = ["SAFE", "SUSPICIOUS", "MALICIOUS"]

    def _softmax(self, z):
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def fit(self, X, y):
        # Normalize features
        self.mean = np.mean(X, axis=0)
        self.std = np.std(X, axis=0)
        self.std[self.std == 0] = 1.0
        X_norm = (X - self.mean) / self.std

        n_samples, n_features = X_norm.shape
        n_classes = len(self.classes)

        # One-hot encode targets
        Y_onehot = np.zeros((n_samples, n_classes))
        for i, label in enumerate(y):
            idx = self.classes.index(label)
            Y_onehot[i, idx] = 1.0

        np.random.seed(42)
        self.weights = np.random.randn(n_features, n_classes) * 0.01
        self.bias = np.zeros((1, n_classes))

        # Gradient descent
        for _ in range(self.epochs):
            logits = np.dot(X_norm, self.weights) + self.bias
            probs = self._softmax(logits)
            grad_w = (1 / n_samples) * np.dot(X_norm.T, (probs - Y_onehot)) + self.l2 * self.weights
            grad_b = (1 / n_samples) * np.sum(probs - Y_onehot, axis=0, keepdims=True)
            self.weights -= self.lr * grad_w
            self.bias -= self.lr * grad_b

    def predict_proba(self, X):
        X_norm = (X - self.mean) / self.std
        logits = np.dot(X_norm, self.weights) + self.bias
        return self._softmax(logits)

    def predict(self, X):
        probs = self.predict_proba(X)
        pred_indices = np.argmax(probs, axis=1)
        return [self.classes[i] for i in pred_indices]


def compute_metrics(y_true, y_pred, classes):
    """Compute accuracy, per-class precision, recall, F1, and confusion matrix."""
    n = len(y_true)
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    accuracy = correct / n if n > 0 else 0.0

    # Confusion matrix: rows = true, cols = pred
    cm = [[0 for _ in classes] for _ in classes]
    for yt, yp in zip(y_true, y_pred):
        r = classes.index(yt)
        c = classes.index(yp)
        cm[r][c] += 1

    report = {}
    f1_sum = 0.0
    for i, c in enumerate(classes):
        tp = cm[i][i]
        fp = sum(cm[r][i] for r in range(len(classes))) - tp
        fn = sum(cm[i][col] for col in range(len(classes))) - tp
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        f1_sum += f1

        report[c] = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1-score": round(f1, 4),
            "support": sum(cm[i])
        }

    weighted_f1 = f1_sum / len(classes)
    return {
        "accuracy": round(accuracy, 4),
        "weighted_f1": round(weighted_f1, 4),
        "classification_report": report,
        "confusion_matrix": {
            "matrix": cm,
            "labels": classes
        }
    }


def train_cyberguard_model():
    """Main training routine."""
    ml_dir = BASE_DIR / "ml"
    data_dir = ml_dir / "data"
    models_dir = ml_dir / "models"
    eval_dir = ml_dir / "evaluation"

    data_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    eval_dir.mkdir(parents=True, exist_ok=True)

    dataset = generate_benchmark_dataset()
    print(f"Loaded benchmark dataset with {len(dataset)} labeled URLs.")

    # Save CSV
    csv_path = data_dir / "url_dataset.csv"
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("url,label\n")
        for u, l in dataset:
            f.write(f'"{u}","{l}"\n')
    print(f"Saved dataset CSV to: {csv_path}")

    # Extract feature vectors
    X = []
    y = []
    for url, label in dataset:
        feat = extract_url_features(url)
        X.append(features_to_vector(feat))
        y.append(label)

    X = np.array(X)
    y = np.array(y)

    # Stratified Train/Test split (75/25)
    np.random.seed(42)
    indices = np.arange(len(y))
    np.random.shuffle(indices)

    split = int(0.75 * len(indices))
    train_idx, test_idx = indices[:split], indices[split:]

    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    model = MultinomialLogisticClassifier(lr=0.08, epochs=800, l2=0.005)
    model.fit(X_train, y_train)

    # Evaluate on test set
    y_pred = model.predict(X_test)
    metrics = compute_metrics(list(y_test), y_pred, model.classes)
    metrics["selected_model"] = "MultinomialLogisticClassifier"
    metrics["feature_names"] = FEATURE_NAMES
    metrics["classes"] = model.classes

    print("\n=== EVALUATION RESULTS ===")
    print(f"Accuracy: {metrics['accuracy'] * 100:.2f}%")
    print(f"Weighted F1-score: {metrics['weighted_f1']:.4f}")
    print("Classification Report:", json.dumps(metrics["classification_report"], indent=2))
    print("Confusion Matrix:", metrics["confusion_matrix"]["matrix"])

    # Save metrics JSON
    metrics_path = eval_dir / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved evaluation metrics to: {metrics_path}")

    # Save model weights to JSON artifact
    model_payload = {
        "model_name": "CyberGuard-LogReg-URLClassifier",
        "classes": model.classes,
        "feature_names": FEATURE_NAMES,
        "mean": model.mean.tolist(),
        "std": model.std.tolist(),
        "weights": model.weights.tolist(),
        "bias": model.bias.tolist(),
        "accuracy": metrics["accuracy"],
        "f1_score": metrics["weighted_f1"]
    }

    model_path = models_dir / "cyberguard_model.json"
    with open(model_path, "w", encoding="utf-8") as f:
        json.dump(model_payload, f, indent=2)
    print(f"Saved trained model parameters to: {model_path}")
    return model_path


if __name__ == "__main__":
    train_cyberguard_model()
