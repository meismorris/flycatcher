import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In local dev, serve /api/scan with the same handler Vercel uses in production,
// so `npm run dev` works with just a .env file.
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/scan', async (req, res) => {
        Object.assign(process.env, env);
        const chunks = [];
        for await (const c of req) chunks.push(c);
        req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
        const { default: handler } = await server.ssrLoadModule('/api/scan.js');
        const wrap = {
          status(code) { res.statusCode = code; return wrap; },
          json(obj) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); }
        };
        await handler(req, wrap);
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), localApi(env)] };
});
