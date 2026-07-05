import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
    ...nextCoreWebVitals,
    ...nextTypescript,
    globalIgnores(['.next/**', 'node_modules/**', 'coverage/**', 'prisma/seed.js']),
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
]);
