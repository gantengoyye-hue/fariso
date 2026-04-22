import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    console.log('[SERVER] Starting with NODE_ENV:', process.env.NODE_ENV || 'development');

    if (process.env.NODE_ENV !== 'production') {
      console.log('[SERVER] Initializing Vite dev server...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      
      app.use(vite.middlewares);

      // Explicit fallback for SPA routes
      app.get('*', async (req, res, next) => {
        const url = req.originalUrl;
        
        // Skip if it looks like an asset (has a dot but not .html)
        const isAsset = url.includes('.') && !url.endsWith('.html');
        if (isAsset) {
          return next();
        }

        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          if (!fs.existsSync(indexPath)) {
            console.error('[SERVER] index.html not found! Path:', indexPath);
            return res.status(404).send('index.html not found. Check project structure.');
          }

          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          console.error('[SERVER] Fallback error for URL:', url, '->', e.message);
          next(e);
        }
      });
    } else {
      console.log('[SERVER] Production mode. Serving dist...');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Build not found. Run "npm run build" first.');
        }
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Success! Listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error: any) {
    console.error('[SERVER] CRITICAL STARTUP FAILURE:', error.stack);
    process.exit(1);
  }
}

startServer();
