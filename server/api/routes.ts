/**
 * CYBERGUARD - REST API Routing Layer
 * Full implementation of analytical, reporting, health, and metadata endpoints.
 */

import { Router, Request, Response } from 'express';
import { extractURLFeatures } from '../features/urlFeatures.js';
import { cyberTrustEngine } from '../identity/cybertrust.js';
import { mlClassifier } from '../ml/model.js';
import { riskEngine } from '../risk_engine/riskEngine.js';
import { threatIntelEngine } from '../threat_intel/reputation.js';
import { aiExplainer } from '../explanation/aiExplainer.js';
import { messageAnalyzer } from '../nlp/messageAnalyzer.js';
import { storageRepo } from '../db/storage.js';
import { CYBERGUARD_ML_METRICS } from '../ml/metrics.js';
import { PYTHON_FEATURE_EXTRACTOR, PYTHON_TRAIN_SCRIPT } from '../ml/exportPython.js';
import { assistantService } from '../chat/assistant.js';

export const apiRouter = Router();

// ==========================================
// 1. HEALTH CHECK
// ==========================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'CYBERGUARD Threat Analysis Engine',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    capabilities: {
      url_feature_extraction: 'ONLINE',
      cybertrust_intelligence: 'ONLINE',
      ml_inference: 'ONLINE',
      nlp_message_scanner: 'ONLINE',
      explainable_ai: process.env.GEMINI_API_KEY ? 'GEMINI_ACTIVE' : 'DETERMINISTIC_FALLBACK_ACTIVE',
      threat_intelligence: 'HYBRID_OFFLINE_READY'
    }
  });
});

// ==========================================
// 2. ANALYZE URL
// ==========================================
apiRouter.post('/analyze/url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Missing required field: "url" must be a non-empty string' });
    }

    const cleanUrl = url.trim();

    // 1. Extract structural, lexical, and host features
    const features = extractURLFeatures(cleanUrl);

    // 2. Run CyberTrust Intelligence (Identity, Brand, Impersonation)
    const cybertrust = cyberTrustEngine.analyzeTrust(features);

    // 3. Run ML Inference (Random Forest / Boosted baseline)
    const mlResult = mlClassifier.predict(features);

    // 4. Query Threat Intelligence (Honest check)
    const threatIntel = await threatIntelEngine.checkReputation(cleanUrl);

    // 5. Compute transparent composite risk
    const riskResult = riskEngine.computeRisk({
      features,
      cybertrust,
      ml_result: mlResult,
      threat_intel: threatIntel
    });

    // 6. Generate human-understandable explanation (Gemini or deterministic)
    const explanation = await aiExplainer.explainFindings({
      targetInput: cleanUrl,
      targetType: 'URL',
      features,
      cybertrust,
      riskResult
    });

    // 7. Save to audit scan log
    const savedScan = storageRepo.saveScan({
      user_id: 'security_analyst',
      target: cleanUrl,
      scan_type: 'URL',
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      claimed_identity: cybertrust.claimed_identity,
      impersonation_detected: cybertrust.impersonation_detected,
      attack_goal: riskResult.attack_goal,
      explanation,
      risk_result: riskResult,
      cybertrust,
      ml_result: mlResult,
      features
    });

    res.json({
      scan_id: savedScan.id,
      target: cleanUrl,
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      model_confidence: riskResult.model_confidence,
      score_breakdown: riskResult.score_breakdown,
      cybertrust,
      ml_result: mlResult,
      signals: riskResult.signals,
      features,
      attack_goal: riskResult.attack_goal,
      explanation,
      recommendations: riskResult.recommendations,
      limitations: riskResult.limitations,
      threat_intelligence: threatIntel,
      created_at: savedScan.created_at
    });
  } catch (err: any) {
    console.error('Error during URL analysis:', err);
    res.status(500).json({ error: 'Internal error processing URL analysis', details: err?.message });
  }
});

// ==========================================
// 3. ANALYZE EMAIL
// ==========================================
apiRouter.post('/analyze/email', async (req: Request, res: Response) => {
  try {
    const { sender = '', subject = '', body = '', urls = [] } = req.body;
    if (!body && !subject) {
      return res.status(400).json({ error: 'Please provide either an email subject or body text' });
    }

    // 1. NLP Analysis
    const nlpScan = messageAnalyzer.analyzeMessage(body, {
      sender,
      subject,
      type: 'EMAIL'
    });

    // 2. If URLs exist or were extracted, analyze the primary URL
    const targetUrl = nlpScan.extracted_urls[0] || (urls.length > 0 ? urls[0] : null);
    let features = targetUrl ? extractURLFeatures(targetUrl) : extractURLFeatures('http://no-embedded-link.local');
    let cybertrust = cyberTrustEngine.analyzeTrust(features, `${sender} ${subject} ${body}`);
    let mlResult = mlClassifier.predict(features);

    // 3. If sender domain mismatch exists, override brand if claimed
    if (nlpScan.sender_analysis?.sender_domain_mismatch && !cybertrust.claimed_identity) {
      const knownBrands = cyberTrustEngine.getBrands();
      const matched = knownBrands.find(b => b.keywords.some(k => sender.toLowerCase().includes(k)));
      if (matched) {
        cybertrust.claimed_identity = matched.name;
        cybertrust.impersonation_status = 'POTENTIAL_IMPERSONATION';
        cybertrust.impersonation_detected = true;
        cybertrust.official_domains = matched.official_domains;
      }
    }

    // 4. Compute composite risk incorporating NLP tactics
    const riskResult = riskEngine.computeRisk({
      features,
      cybertrust,
      ml_result: mlResult,
      nlp_signals: nlpScan.tactics_detected
    });

    // 5. Generate human-understandable explanation
    const explanation = await aiExplainer.explainFindings({
      targetInput: `Email: "${subject || 'Suspicious Notice'}" from ${sender || 'Unknown Sender'}`,
      targetType: 'EMAIL',
      features,
      cybertrust,
      riskResult,
      rawTextContext: body
    });

    // 6. Save scan
    const savedScan = storageRepo.saveScan({
      user_id: 'security_analyst',
      target: `Email from: ${sender || 'Unknown'} - Subject: ${subject || '(No Subject)'}`,
      scan_type: 'EMAIL',
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      claimed_identity: cybertrust.claimed_identity,
      impersonation_detected: cybertrust.impersonation_detected,
      attack_goal: riskResult.attack_goal,
      explanation,
      risk_result: riskResult,
      cybertrust,
      ml_result: mlResult,
      features
    });

    res.json({
      scan_id: savedScan.id,
      nlp_analysis: nlpScan,
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      cybertrust,
      signals: riskResult.signals,
      explanation,
      recommendations: riskResult.recommendations,
      limitations: riskResult.limitations,
      created_at: savedScan.created_at
    });
  } catch (err: any) {
    console.error('Error during email analysis:', err);
    res.status(500).json({ error: 'Internal error processing email analysis', details: err?.message });
  }
});

// ==========================================
// 4. ANALYZE MESSAGE (SMS / WhatsApp / Telegram)
// ==========================================
apiRouter.post('/analyze/message', async (req: Request, res: Response) => {
  try {
    const { text, messageType = 'SMS' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing required field: "text"' });
    }

    const nlpScan = messageAnalyzer.analyzeMessage(text, {
      type: messageType as any
    });

    const primaryUrl = nlpScan.extracted_urls[0];
    const features = primaryUrl ? extractURLFeatures(primaryUrl) : extractURLFeatures('http://no-link-message.local');
    const cybertrust = cyberTrustEngine.analyzeTrust(features, text);
    const mlResult = mlClassifier.predict(features);

    const riskResult = riskEngine.computeRisk({
      features,
      cybertrust,
      ml_result: mlResult,
      nlp_signals: nlpScan.tactics_detected
    });

    const explanation = await aiExplainer.explainFindings({
      targetInput: text.slice(0, 100),
      targetType: 'MESSAGE',
      features,
      cybertrust,
      riskResult,
      rawTextContext: text
    });

    const savedScan = storageRepo.saveScan({
      user_id: 'security_analyst',
      target: text.length > 80 ? text.slice(0, 77) + '...' : text,
      scan_type: 'MESSAGE',
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      claimed_identity: cybertrust.claimed_identity,
      impersonation_detected: cybertrust.impersonation_detected,
      attack_goal: riskResult.attack_goal,
      explanation,
      risk_result: riskResult,
      cybertrust,
      ml_result: mlResult,
      features
    });

    res.json({
      scan_id: savedScan.id,
      nlp_analysis: nlpScan,
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      cybertrust,
      signals: riskResult.signals,
      explanation,
      recommendations: riskResult.recommendations,
      limitations: riskResult.limitations,
      created_at: savedScan.created_at
    });
  } catch (err: any) {
    console.error('Error during message analysis:', err);
    res.status(500).json({ error: 'Internal error processing message analysis', details: err?.message });
  }
});

// ==========================================
// 5. ANALYZE WEBSITE (SSRF-Protected)
// ==========================================
apiRouter.post('/analyze/website', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing required field: "url"' });
    }

    const cleanUrl = url.trim();

    // 1. SSRF-Safe probe
    const safeProbe = await threatIntelEngine.probeWebsiteSafely(cleanUrl);

    // 2. URL and CyberTrust processing
    const features = extractURLFeatures(cleanUrl);
    const cybertrust = cyberTrustEngine.analyzeTrust(features);
    const mlResult = mlClassifier.predict(features);

    // 3. Compute risk
    const riskResult = riskEngine.computeRisk({
      features,
      cybertrust,
      ml_result: mlResult
    });

    // If SSRF blocked, elevate to critical alert
    if (safeProbe.ssrf_blocked) {
      riskResult.signals.unshift({
        indicator: 'SSRF Attack Detected',
        severity: 'CRITICAL',
        points: 50,
        explanation: 'Attempted to probe internal private network or metadata service via SSRF.'
      });
      riskResult.risk_score = 100;
      riskResult.risk_level = 'CRITICAL';
    }

    const explanation = await aiExplainer.explainFindings({
      targetInput: cleanUrl,
      targetType: 'WEBSITE',
      features,
      cybertrust,
      riskResult
    });

    const savedScan = storageRepo.saveScan({
      user_id: 'security_analyst',
      target: cleanUrl,
      scan_type: 'WEBSITE',
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      claimed_identity: cybertrust.claimed_identity,
      impersonation_detected: cybertrust.impersonation_detected,
      attack_goal: riskResult.attack_goal,
      explanation,
      risk_result: riskResult,
      cybertrust,
      ml_result: mlResult,
      features
    });

    res.json({
      scan_id: savedScan.id,
      probe_results: safeProbe,
      risk_score: riskResult.risk_score,
      risk_level: riskResult.risk_level,
      threat_type: riskResult.threat_type,
      cybertrust,
      signals: riskResult.signals,
      features,
      explanation,
      recommendations: riskResult.recommendations,
      limitations: riskResult.limitations,
      created_at: savedScan.created_at
    });
  } catch (err: any) {
    console.error('Error during website probe:', err);
    res.status(500).json({ error: 'Internal error processing website probe', details: err?.message });
  }
});

// ==========================================
// 6. SCANS & HISTORY
// ==========================================
apiRouter.get('/scans', (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ scans: storageRepo.getScans(limit, type) });
});

apiRouter.get('/scans/:id', (req: Request, res: Response) => {
  const scan = storageRepo.getScanById(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json({ scan });
});

// ==========================================
// 7. DASHBOARD STATS
// ==========================================
apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  res.json(storageRepo.getDashboardStats());
});

// ==========================================
// 8. INCIDENT REPORTS
// ==========================================
apiRouter.post('/reports/:id', (req: Request, res: Response) => {
  const report = storageRepo.generateReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Scan not found for report generation' });
  res.json({ report });
});

// ==========================================
// 9. BRAND REGISTRY (CYBERTRUST KNOWLEDGE BASE)
// ==========================================
apiRouter.get('/brands', (req: Request, res: Response) => {
  res.json({ brands: cyberTrustEngine.getBrands() });
});

apiRouter.post('/brands', (req: Request, res: Response) => {
  const { id, name, shortName, official_domains, keywords, category, country, critical_assets } = req.body;
  if (!id || !name || !official_domains || !Array.isArray(official_domains)) {
    return res.status(400).json({ error: 'Invalid brand payload. Required: id, name, official_domains[]' });
  }

  const newBrand = {
    id,
    name,
    shortName: shortName || name,
    official_domains,
    keywords: keywords || [name.toLowerCase()],
    category: category || 'Enterprise',
    country: country || 'US',
    critical_assets: critical_assets || ['User Credentials']
  };

  cyberTrustEngine.addBrand(newBrand);
  storageRepo.addBrand(newBrand);

  res.status(201).json({ message: 'Brand entity registered into CyberTrust Engine', brand: newBrand });
});

// ==========================================
// 10. ML METRICS & PYTHON CODE EXPORTS
// ==========================================
apiRouter.get('/ml/metrics', (req: Request, res: Response) => {
  res.json(CYBERGUARD_ML_METRICS);
});

apiRouter.get('/ml/export-python', (req: Request, res: Response) => {
  res.json({
    feature_extractor_code: PYTHON_FEATURE_EXTRACTOR,
    training_script_code: PYTHON_TRAIN_SCRIPT
  });
});

// ==========================================
// 11. CYBERGUARD AI ASSISTANT CHAT
// ==========================================
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, scanContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing required field: "messages" array.' });
    }

    const result = await assistantService.chat({
      messages,
      scanContext: scanContext || null
    });

    res.json(result);
  } catch (err: any) {
    console.error('[CYBERGUARD Chat Error]:', err);
    res.status(500).json({
      error: 'Failed to process chat response',
      details: err?.message || 'Internal error'
    });
  }
});
