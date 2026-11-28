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
      ADMIN_WEB: envField.boolean({ context: 'server', access: 'secret', optional: true, default: false }),
      ADMIN_CLAVE: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_DIRECCIONES: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_SECRETO: envField.string({ context: 'server', access: 'secret', optional: true }),
      PARED_VIVA_WASM: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESTAURADOR_DIRECCION: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
