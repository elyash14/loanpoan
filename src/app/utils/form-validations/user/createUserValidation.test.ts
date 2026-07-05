import { describe, expect, it } from 'vitest';
import { createUserValidationSchema } from './createUserValidation';

describe('createUserValidationSchema', () => {
    it('accepts valid user data', () => {
        const result = createUserValidationSchema.safeParse({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            gender: 'WOMAN',
            password: 'password123',
        });

        expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
        const result = createUserValidationSchema.safeParse({
            firstName: '',
            lastName: 'Doe',
            email: 'invalid',
            gender: 'WOMAN',
            password: '12',
        });

        expect(result.success).toBe(false);
    });
});
