import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'eslint.config.js',
      '**/eslint.config.js',
      '**/eslint.config.mjs',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ...js.configs.recommended,
    ...eslintPluginPrettierRecommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'linebreak-style': ['error', 'unix'],
    },
  },
];
