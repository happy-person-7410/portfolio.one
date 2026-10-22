import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cloudflare-pages-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api' || req.url.startsWith('/api/'))) {
              try {
                const url = `http://${req.headers.host || 'localhost:3000'}${req.url}`;
                let body: Uint8Array | undefined = undefined;
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                  const buffers: Buffer[] = [];
                  for await (const chunk of req) {
                    buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                  }
                  if (buffers.length > 0) {
                    body = new Uint8Array(Buffer.concat(buffers));
                  }
                }
                const headers = new Headers();
                for (const [key, value] of Object.entries(req.headers)) {
                  if (value) {
                    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
                  }
                }
                const reqInit: RequestInit & { duplex?: string } = {
                  method: req.method,
                  headers,
                  body: body as unknown as BodyInit,
                  duplex: 'half',
                };
                const webReq = new Request(url, reqInit as RequestInit);

                const { handleApiRequest } = await import('./src/server/apiHandler.ts');
                const response = await handleApiRequest(webReq, {
                  DATABASE_URL: process.env.DATABASE_URL,
                  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
                  ADMIN_DEFAULT_EMAIL: process.env.ADMIN_DEFAULT_EMAIL,
                  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD,
                  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
                  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
                  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
                  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
                  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
                });

                res.statusCode = response.status;
                response.headers.forEach((val, key) => {
                  res.setHeader(key, val);
                });
                const text = await response.text();
                res.end(text);
                return;
              } catch (err: unknown) {
                console.error('API error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: (err as Error).message }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
