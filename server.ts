import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Initializing Exalance in ${process.env.NODE_ENV || 'development'} mode`);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mode: process.env.NODE_ENV,
      version: '1.0.4-unified-fallback',
      timestamp: new Date().toISOString(),
      cwd: process.cwd()
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.includes('.') && !url.endsWith('.html')) return next();

      try {
        const templatePath = path.resolve(root, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production
    const distPath = path.resolve(root, 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Exalance listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FATAL] Server crash:', err);
  process.exit(1);
});
