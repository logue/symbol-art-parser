import { defineConfig, type UserConfig } from 'vite';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
const config: UserConfig = {
  base: './',
  // https://vitejs.dev/config/#server-options
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  plugins: [
    // vite-plugin-checker
    // https://github.com/fi3ework/vite-plugin-checker
    checker({
      typescript: true,
      vueTsc: false,
      eslint: {
        lintCommand: 'eslint', // for example, lint .ts & .tsx
      },
    }),
  ],
  // Build Options
  // https://vitejs.dev/config/#build-options
  build: {
    outDir: 'docs',
    target: 'es2021',
  },
};

// Export vite config
export default defineConfig(config);
