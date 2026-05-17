import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

import pluginImport from 'eslint-plugin-import-x';
import pluginJsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import pluginTsdoc from 'eslint-plugin-tsdoc';

/**
 * ESLint Config
 */
export default [
  {
    ignores: [
      '.vscode/',
      'dist/',
      'docs/',
      'public/',
      'src/**/*.generated.*',
      'eslint.config.js',
      'pnpm-lock.yaml',
    ],
  },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parserOptions: {
        project: [
          'tsconfig.app.json',
          'tsconfig.node.json',
          'tsconfig.vitest.json',
        ],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'import-x': pluginImport,
      tsdoc: pluginTsdoc,
    },
    settings: {
      // This will do the trick
      'import-x/parsers': {
        espree: ['.js', '.cjs', '.mjs', '.jsx'],
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: [
            'tsconfig.app.json',
            'tsconfig.node.json',
            'tsconfig.vitest.json',
          ],
        },
        node: true,
        alias: {
          map: [
            ['@', './src'],
            ['~', './node_modules'],
          ],
          extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
        },
      },
      vite: {
        configPath: './vite.config.ts',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      // ...importPlugin.configs["recommended"].rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // const lines: string[] = []; style
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],
      // Enable @ts-ignore etc.
      '@typescript-eslint/ban-ts-comment': 'off',
      // Left-hand side style
      '@typescript-eslint/consistent-generic-constructors': [
        'error',
        'type-annotation',
      ],
      // Enable import sort order, see bellow.
      '@typescript-eslint/consistent-type-imports': [
        'off',
        {
          prefer: 'type-imports',
        },
      ],
      // Fix for pinia
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Allow short land for pretter
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      // Fix for vite import.meta.env
      '@typescript-eslint/strict-boolean-expressions': 'off',
      // Fix for vite env.d.ts.
      '@typescript-eslint/triple-slash-reference': 'off',
      // Fix for Vue setup style
      'import-x/default': 'off',
      // Fix for Vue setup style
      'import-x/no-default-export': 'off',
      // Sort Import Order.
      // see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#importorder-enforce-a-convention-in-module-import-order
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            // Vue Core
            {
              pattern:
                '{vue,vue-router,vuex,@/stores,vue-i18n,pinia,vite,vitest,vitest/**,@vitejs/**,@vue/**}',
              group: 'external',
              position: 'before',
            },
            // Internal Codes
            {
              pattern: '{@/**}',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
          },
          'newlines-between': 'always',
        },
      ],
      'tsdoc/syntax': 'warn',
    },
  },
  // ...pluginVue.configs['flat/recommended'],
  ...pluginJsonSchemaValidator.configs.base,
  {
    files: ['schema.json'],
    rules: {
      'json-schema-validator/no-invalid': 'error',
    },
  },
  eslintConfigPrettier,
];
