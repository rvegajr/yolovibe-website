import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'cli/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.cli.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        global: 'writable',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        NodeJS: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for development
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Can be overly strict
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // General code quality
      'no-console': 'off', // Allow console for CLI tools and logging
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'off', // TypeScript handles this better
      'no-unused-vars': 'off', // Use TypeScript version instead
      
      // Import organization - disabled for now to avoid conflicts
      'sort-imports': 'off',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.js',
      '*.mjs',
      '.astro/',
    ],
  },
];
