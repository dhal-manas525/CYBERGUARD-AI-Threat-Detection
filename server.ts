/**
 * CYBERGUARD - Full-Stack Express Server Entry Point
 * Host on port 3000, mounting Vite middlewares in dev mode.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/api/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Security & Parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        const duration = Date.now() - start;
        console.log(`[CYBERGUARD API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // API router mount
  app.use('/api', apiRouter);

  // Vite development integration or static dist serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[CYBERGUARD] Vite development middleware attached.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[CYBERGUARD] Serving production assets from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBERGUARD ENGINE] Operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CYBERGUARD] Fatal startup error:', err);
  process.exit(1);
});
