import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type UserConfig } from 'vite';

import banner from 'vite-plugin-banner';
import { checker } from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

/**
 * Vite Configure
 *
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig(({ mode }): UserConfig => {
  const buildDate = new Date().toISOString();

  const config: UserConfig = {
    // https://vitejs.dev/config/shared-options.html#base
    base: '/symbol-art-parser/',
    // https://vitejs.dev/config/shared-options.html#define
    define: {
      'process.env': {},
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(buildDate),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      mode === 'docs'
        ? undefined
        : checker({
            typescript: true,
            // vueTsc: true,
            // eslint: { lintCommand: 'eslint' },
            // stylelint: { lintCommand: 'stylelint' },
          }),
      // vite-plugin-banner
      // https://github.com/chengpeiquan/vite-plugin-banner
      mode === 'docs'
        ? undefined
        : banner(`/**
 * ${pkg.name}
 *
 * @description ${pkg.description}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @copyright 2022-${new Date().getFullYear()} By Masashi Yoshikawa All rights reserved.
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @see {@link ${pkg.homepage}}
 */
`),
      // vite-plugin-dts
      // https://github.com/qmhc/vite-plugin-dts
      mode === 'docs'
        ? undefined
        : dts({
            tsconfigPath: './tsconfig.app.json',
            entryRoot: 'src',
            outDirs: 'dist',
          }),
    ],
    build: {
      outDir: mode === 'docs' ? 'docs' : 'dist',
      ...(mode !== 'docs' && {
        lib: {
          entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
          name: 'SymbolArt',
          formats: ['es', 'umd', 'iife'],
          fileName: format => `index.${format}.js`,
        },
      }),
      rollupOptions: {
        ...(mode === 'docs' && {
          input: fileURLToPath(new URL('./index.html', import.meta.url)),
        }),
      },
    },
  };

  return config;
});
