import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
    resolve: {
        alias: {
            utils: path.resolve(__dirname, 'src/app/utils'),
            '@database': path.resolve(__dirname, 'prisma/database'),
        },
    },
});
