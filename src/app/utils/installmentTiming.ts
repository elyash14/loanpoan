import {
    addMonths as addJalaliMonths,
    getDate as getJalaliDate,
    setDate as setJalaliDate,
} from "date-fns-jalali";
import type { DateType } from "utils/calendarPeriod";

export type InstallmentTimingDays = {
    dueDay: number;
    payDay: number;
};

export type PeriodDates = {
    /** Generation / payable-open day (config dueDay) */
    openAt: Date;
    /** Payment deadline stored as Installment.dueDate / Payment.dueDate (config payDay) */
    deadlineAt: Date;
};

export type DueWindowStatus = "closed" | "payable" | "overdue";

const MAX_DAY = 29;

export function clampInstallmentDay(day: number): number {
    if (!Number.isFinite(day)) return 1;
    return Math.min(MAX_DAY, Math.max(1, Math.trunc(day)));
}

/** Set calendar day-of-month using Jalali or Gregorian rules. */
export function setDayOfMonth(date: Date, day: number, dateType: DateType): Date {
    const safeDay = clampInstallmentDay(day);
    if (dateType === "JALALI") {
        return setJalaliDate(date, safeDay);
    }
    const next = new Date(date);
    next.setDate(safeDay);
    return next;
}

export function getDayOfMonth(date: Date, dateType: DateType): number {
    if (dateType === "JALALI") {
        return getJalaliDate(date);
    }
    return date.getDate();
}

export function addCalendarMonths(date: Date, months: number, dateType: DateType): Date {
    if (dateType === "JALALI") {
        return addJalaliMonths(date, months);
    }
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
}

/**
 * Build open + deadline dates for the calendar month of `anchor`
 * (after optionally moving `monthsAhead` months).
 */
export function buildPeriodDates(
    anchor: Date,
    dueDay: number,
    payDay: number,
    dateType: DateType,
    monthsAhead = 0,
): PeriodDates {
    const base = monthsAhead === 0 ? new Date(anchor) : addCalendarMonths(anchor, monthsAhead, dateType);
    const openAt = setDayOfMonth(base, dueDay, dateType);
    const deadlineAt = setDayOfMonth(base, payDay, dateType);
    return { openAt, deadlineAt };
}

/** Payable window starts on dueDay of the same month as the deadline (payDay). */
export function getPaymentWindowStart(
    deadlineAt: Date,
    dueDay: number,
    dateType: DateType,
): Date {
    return setDayOfMonth(deadlineAt, dueDay, dateType);
}

export function isOverdue(now: Date, deadlineAt: Date): boolean {
    return deadlineAt < now;
}

export function isPaymentWindowOpen(now: Date, deadlineAt: Date, dueDay: number, dateType: DateType): boolean {
    return now >= getPaymentWindowStart(deadlineAt, dueDay, dateType);
}

export function classifyDueStatus(
    now: Date,
    deadlineAt: Date,
    dueDay: number,
    dateType: DateType,
): DueWindowStatus {
    if (isOverdue(now, deadlineAt)) return "overdue";
    if (isPaymentWindowOpen(now, deadlineAt, dueDay, dateType)) return "payable";
    return "closed";
}

/**
 * If an unpaid row still uses the old meaning (dueDate day === generation dueDay),
 * move it to payDay in the same calendar month.
 */
export function healDeadlineIfNeeded(
    dueDate: Date,
    dueDay: number,
    payDay: number,
    dateType: DateType,
): Date | null {
    const day = getDayOfMonth(dueDate, dateType);
    const openDay = clampInstallmentDay(dueDay);
    const deadlineDay = clampInstallmentDay(payDay);
    if (day !== openDay || openDay === deadlineDay) {
        return null;
    }
    return setDayOfMonth(dueDate, deadlineDay, dateType);
}
