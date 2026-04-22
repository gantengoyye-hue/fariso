import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add a simple health check that doesn't depend on Vite or static files
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('[SERVER] Starting in DEVELOPMENT mode');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa', // Let Vite handle SPA fallback in dev
      });
      
      app.use(vite.middlewares);
      
      console.log('[SERVER] Vite middleware loaded');
    } catch (e) {
      console.error('[SERVER] Failed to load Vite:', e);
      // Fallback if Vite fails to load
      app.get('*', (req, res) => {
        res.status(500).send('Vite failed to start. Check server logs.');
      });
    }
  } else {
    console.log('[SERVER] Starting in PRODUCTION mode');
    const distPath = path.resolve(process.cwd(), 'dist');
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('index.html not found in dist. Build might be incomplete.');
        }
      });
    } else {
      console.error('[SERVER] dist folder not found! Path:', distPath);
      app.get('*', (req, res) => {
        res.status(404).send('Production build (dist) not found. Please run build script.');
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('[SERVER] Server error:', err);
  });
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER] Uncaught Exception:', err);
});

startServer().catch(err => {
  console.error('[SERVER] Fatal startup error:', err);
  process.exit(1);
});
