import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  env: {
    schema: {
      PINATA_JWT: envField.string({ context: 'server', access: 'secret', optional: true }),
      GRIFO_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
      FIRMA_DEMO: envField.boolean({ context: 'server', access: 'secret', optional: true, default: false }),
      FIRMANTE1_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
      FIRMANTE2_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
      FIRMANTE3_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
