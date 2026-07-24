import { describe, expect, it } from 'vitest';
import { calculateLoanPayments } from './calculatePayment';

describe('calculateLoanPayments', () => {
    const start = new Date('2024-01-15');

    it('splits total evenly across payment count', () => {
        const result = calculateLoanPayments(1000, 4, 0, start, 'GREGORIAN');

        expect(result.error).toBeUndefined();
        expect(result.payments).toHaveLength(4);
        expect(result.payments!.every((p) => p.amount === 250)).toBe(true);
    });

    it('uses custom amount when provided', () => {
        const result = calculateLoanPayments(1000, 10, 300, start, 'GREGORIAN');

        expect(result.error).toBeUndefined();
        expect(result.payments).toHaveLength(4);
        expect(result.payments!.slice(0, 3).every((p) => p.amount === 300)).toBe(true);
        expect(result.payments![3].amount).toBe(100);
    });

    it('returns error when custom amount exceeds total', () => {
        const result = calculateLoanPayments(100, 4, 200, start, 'GREGORIAN');

        expect(result.error).toBe("Custom amount can't be greater than total amount!");
        expect(result.payments).toHaveLength(0);
    });

    it('returns error when payment count exceeds 50', () => {
        const result = calculateLoanPayments(10000, 51, 100, start, 'GREGORIAN');

        expect(result.error).toBe('Payment count must be less than 50');
        expect(result.payments).toHaveLength(0);
    });

    it('generates jalali schedule dates', () => {
        const result = calculateLoanPayments(600, 3, 0, start, 'JALALI');

        expect(result.error).toBeUndefined();
        expect(result.payments).toHaveLength(3);
        expect(result.payments![0].date).toBeInstanceOf(Date);
    });

    it('snaps gregorian payment dates to payDay across months', () => {
        const result = calculateLoanPayments(900, 3, 0, start, 'GREGORIAN', 5);

        expect(result.error).toBeUndefined();
        expect(result.payments).toHaveLength(3);
        expect(result.payments!.map((p) => p.date.getDate())).toEqual([5, 5, 5]);
        expect(result.payments!.map((p) => p.date.getMonth())).toEqual([1, 2, 3]); // Feb, Mar, Apr
    });

    it('uses custom payDay for gregorian schedule', () => {
        const result = calculateLoanPayments(600, 2, 0, start, 'GREGORIAN', 10);

        expect(result.payments!.map((p) => p.date.getDate())).toEqual([10, 10]);
    });
});
