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
  const mode = process.env.NODE_ENV || 'production';
  const isProd = mode === 'production';

  console.log(`[INIT] Starting server in "${mode}" mode`);
  console.log(`[INIT] Current working directory: ${process.cwd()}`);
  console.log(`[INIT] DISABLE_HMR: ${process.env.DISABLE_HMR}`);

  // Request logger
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    const distPath = path.resolve(root, 'dist');
    let distFiles: string[] = [];
    if (fs.existsSync(distPath)) {
      distFiles = fs.readdirSync(distPath);
    }

    res.json({ 
      status: 'ok', 
      mode: process.env.NODE_ENV,
      version: '1.0.9-bundled',
      timestamp: new Date().toISOString(),
      cwd: process.cwd(),
      distExists: fs.existsSync(distPath),
      distFiles
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false, // Explicitly disable HMR
      },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();

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
    
    // Serve static files first
    app.use(express.static(distPath));
    
    // SPA Fallback for all other routes
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[404-FALLBACK] File not found: ${indexPath} for URL: ${req.url}`);
        res.status(404).send('Production build not found. Running build first might help.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[READY] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FATAL] Server crash:', err);
  process.exit(1);
});
