export type FormatLocale = "en" | "fa";

const CURRENCY: Record<FormatLocale, string> = {
    en: "IRT",
    fa: "ریال",
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toLocaleDigits(value: string | number, locale: FormatLocale = "en"): string {
    const text = String(value);
    if (locale !== "fa") return text;
    return text.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function formatNumber(
    value: string | number | null | undefined,
    locale: FormatLocale = "en",
): string {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return locale === "fa" ? "۰" : "0";
    return num.toLocaleString(locale === "fa" ? "fa-IR" : "en-US", {
        maximumFractionDigits: 10,
    });
}

export function formatMoney(
    value: string | number | null | undefined,
    locale: FormatLocale = "en",
): string {
    return `${formatNumber(value, locale)} ${CURRENCY[locale]}`;
}

export function formatPercent(
    value: string | number | null | undefined,
    locale: FormatLocale = "en",
): string {
    return `${formatNumber(value, locale)}%`;
}
