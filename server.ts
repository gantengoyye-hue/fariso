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
  const isProd = process.env.NODE_ENV === 'production';

  console.log(`[SERVER] Initializing Exalance in ${process.env.NODE_ENV || 'production (default)'} mode`);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mode: process.env.NODE_ENV || 'production (defaulted)',
      version: '1.0.5-explicit-prod',
      timestamp: new Date().toISOString(),
      cwd: process.cwd()
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa', // Changed to spa for automatic fallback handling
    });
    
    app.use(vite.middlewares);
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
        res.status(404).send('Production build not found. Running build first might help.');
      }
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
