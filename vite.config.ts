/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { checker } from 'vite-plugin-checker';
import { defineConfig, type UserConfig } from 'vite';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';

import { fileURLToPath, URL } from 'node:url';
import { writeFileSync } from 'node:fs';

import pkg from './package.json';

// Export vite config
export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  // Hook production build.
  // https://vitejs.dev/config/
  const config: UserConfig = {
    // Resolver
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
      },
    },
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
          lintCommand:
            'eslint ./src --fix --cache --cache-location ./node_modules/.vite/vite-plugin-eslint',
        },
      }),
      // vite-plugin-banner
      // https://github.com/chengpeiquan/vite-plugin-banner
      banner(`/**
 * ${pkg.name}
 *
 * @description ${pkg.description}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @copyright 2022-2023 By Masashi Yoshikawa All rights reserved.
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
            tsConfigFilePath: './tsconfig.app.json',
          }),
    ],
    // Build Options
    // https://vitejs.dev/config/#build-options
    build:
      mode === 'docs'
        ? {
            outDir: 'docs',
            minify: true,
          }
        : {
            lib: {
              entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
              name: 'SymbolArt',
              formats: ['es', 'umd', 'iife'],
              fileName: format => `index.${format}.js`,
            },
            target: 'esnext',
            minify: false,
          },
    esbuild: {
      drop: command === 'serve' ? [] : ['console'],
    },
  };

  // Write meta data.
  writeFileSync(
    fileURLToPath(new URL('src/Meta.ts', import.meta.url)),
    `import type MetaInterface from './interfaces/MetaInterface';

// This file is auto-generated by the build system.
const meta: MetaInterface = {
  version: '${pkg.version}',
  date: '${new Date().toISOString()}',
};
export default meta;
`
  );

  return config;
});