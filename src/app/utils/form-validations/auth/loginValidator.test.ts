import { describe, expect, it } from 'vitest';
import { loginValidatorSchema } from './loginValidator';

describe('loginValidatorSchema', () => {
    it('accepts valid credentials', () => {
        const result = loginValidatorSchema.safeParse({
            email: 'user@example.com',
            password: 'secret',
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
        const result = loginValidatorSchema.safeParse({
            email: 'not-an-email',
            password: 'secret',
        });

        expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
        const result = loginValidatorSchema.safeParse({
            email: 'user@example.com',
            password: 'ab',
        });

        expect(result.success).toBe(false);
    });
});
