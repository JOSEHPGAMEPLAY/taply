import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/', 'dist/', '.next/', 'coverage/'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
