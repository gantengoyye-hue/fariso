import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import vite to avoid loading it in production
    const { createServer: createViteServer } = await import('vite');
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);

    // Development fallback
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Skip assets
      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Production serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Ready on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});
