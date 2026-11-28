import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const dominioPropio = process.env.DOMINIO_PUBLICO;

export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    allowedDomains: [
      { hostname: '**.up.railway.app', protocol: 'https' },
      ...(dominioPropio ? [{ hostname: dominioPropio, protocol: 'https' }] : []),
    ],
  },
  env: {
    schema: {
      PINATA_JWT: envField.string({ context: 'server', access: 'secret', optional: true }),
      GRIFO_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
