import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isHmrDisabled = process.env.DISABLE_HMR === 'true' || mode === 'production';

  return {
    plugins: [
      react(), 
      tailwindcss(),
      // Custom plugin to nuke @vite/client when HMR is disabled to prevent WebSocket errors
      {
        name: 'nuke-vite-client',
        transformIndexHtml(html) {
          if (isHmrDisabled) {
            return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
          }
          return html;
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
