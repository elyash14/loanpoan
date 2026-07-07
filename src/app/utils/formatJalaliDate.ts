import { format as formatJalali } from "date-fns-jalali";
import { enUS } from "date-fns-jalali/locale/en-US";
import { faIR } from "date-fns-jalali/locale/fa-IR";
import { toLocaleDigits, type FormatLocale } from "./formatMoney";

const PATTERN_MAP: Record<string, string> = {
    "YYYY-MM-DD": "yyyy/MM/dd",
    "YYYY-MM-DD HH:mm": "yyyy/MM/dd HH:mm",
    "MMM D, YYYY": "d MMM yyyy",
    "MMM D, YYYY HH:mm": "d MMM yyyy HH:mm",
};

function resolveLocale(locale: FormatLocale) {
    return locale === "fa" ? faIR : enUS;
}

function toDate(value: string | Date): Date | null {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatJalaliDate(
    value: string | Date | null | undefined,
    pattern = "YYYY-MM-DD",
    locale: FormatLocale = "fa",
): string {
    if (value == null || value === "") return "";
    const date = toDate(value);
    if (!date) return "";

    const dateFnsPattern = PATTERN_MAP[pattern] ?? pattern;
    const formatted = formatJalali(date, dateFnsPattern, { locale: resolveLocale(locale) });
    return toLocaleDigits(formatted, locale);
}

export function getJalaliYearMonth(value: string | Date) {
    const date = toDate(value);
    if (!date) return { year: 0, month: 0 };

    return {
        year: Number(formatJalali(date, "yyyy", { locale: faIR })),
        month: Number(formatJalali(date, "M", { locale: faIR })),
    };
}
