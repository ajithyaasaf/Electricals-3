/**
 * ESLint Configuration for CopperBear Electrical
 * 
 * ARCHITECTURE ENFORCEMENT:
 * This config includes rules that prevent frontend code from directly
 * writing to Firestore. All data mutations must go through the backend API.
 * 
 * @see docs/ARCHITECTURE_DECISION.md
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,

    parser: '@typescript-eslint/parser',

    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },

    env: {
        browser: true,
        es2022: true,
        node: true,
    },

    extends: [
        'eslint:recommended',
    ],

    plugins: [
        '@typescript-eslint',
    ],

    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.replit',
        '*.min.js',
    ],

    rules: {
        // Allow unused vars with underscore prefix (common pattern)
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],

        // Warn on console.log in production code (allow warn, error, info)
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },

    overrides: [
        // ═══════════════════════════════════════════════════════════════════════
        // ARCHITECTURE ENFORCEMENT: Ban Firestore writes in frontend code
        // ═══════════════════════════════════════════════════════════════════════
        {
            files: ['client/**/*.ts', 'client/**/*.tsx'],
            rules: {
                /**
                 * CRITICAL: Prevent direct Firestore writes from frontend
                 * 
                 * This rule enforces the backend-only data mutations architecture.
                 * All write operations must go through the Express API.
                 * 
                 * Allowed: onSnapshot, doc, collection, getDoc, getDocs (read operations)
                 * Banned: setDoc, addDoc, updateDoc, deleteDoc, writeBatch, runTransaction
                 * 
                 * If you need to write data, use:
                 *   import { apiRequest } from '@/lib/queryClient';
                 *   await apiRequest('POST', '/api/your-endpoint', data);
                 */
                'no-restricted-imports': [
                    'error',
                    {
                        paths: [
                            {
                                name: 'firebase/firestore',
                                importNames: [
                                    'setDoc',
                                    'addDoc',
                                    'updateDoc',
                                    'deleteDoc',
                                    'writeBatch',
                                    'runTransaction',
                                ],
                                message: `
🚫 ARCHITECTURE VIOLATION: Direct Firestore writes are not allowed from frontend.

All data mutations must go through the backend API to ensure:
- Server-side validation with Zod
- Admin role enforcement
- Audit trail (lastUpdated, updatedBy)
- Single source of truth

Use instead:
  import { apiRequest } from '@/lib/queryClient';
  await apiRequest('POST', '/api/your-endpoint', data);

See: docs/ARCHITECTURE_DECISION.md
                `.trim(),
                            },
                        ],
                    },
                ],
            },
        },

        // Server-side code can use Firestore writes (via Admin SDK)
        {
            files: ['server/**/*.ts'],
            rules: {
                // Allow console.log on server for debugging
                'no-console': 'off',
            },
        },

        // Shared code should not have Firestore write operations
        {
            files: ['shared/**/*.ts'],
            rules: {
                'no-restricted-imports': [
                    'warn',
                    {
                        paths: [
                            {
                                name: 'firebase/firestore',
                                importNames: [
                                    'setDoc',
                                    'addDoc',
                                    'updateDoc',
                                    'deleteDoc',
                                    'writeBatch',
                                    'runTransaction',
                                ],
                                message: 'Shared code should not contain Firestore write operations. Put writes in server code.',
                            },
                        ],
                    },
                ],
            },
        },
    ],

    settings: {
        react: {
            version: 'detect',
        },
    },
};
