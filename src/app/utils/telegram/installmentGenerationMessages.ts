import { format } from "date-fns-jalali";
import dayjs from "dayjs";
import { getMonth } from "utils/date";
import type { GlobalConfigType } from "utils/types/configs";
import type { TelegramMessageLocale } from "./paymentRequestMessages";

function monthKey(date: Date, dateType: GlobalConfigType["dateType"]): string {
    if (dateType === "JALALI") {
        return format(date, "yyyy-MM");
    }
    return dayjs(date).format("YYYY-MM");
}

function formatMonthLabel(
    date: Date,
    dateType: GlobalConfigType["dateType"],
    locale: TelegramMessageLocale,
): string {
    if (dateType === "JALALI") {
        const month = getMonth(date, dateType);
        const year = format(date, "yyyy");
        return locale === "fa" ? `${month} ${year}` : `${month} ${year}`;
    }

    const month = dayjs(date).format("MMMM");
    const year = dayjs(date).format("YYYY");
    return `${month} ${year}`;
}

export function formatInstallmentMonths(
    dueDates: Date[],
    dateType: GlobalConfigType["dateType"],
    locale: TelegramMessageLocale,
): string | null {
    if (dueDates.length === 0) {
        return null;
    }

    const uniqueMonths = [...new Map(
        dueDates.map((date) => [monthKey(date, dateType), date]),
    ).values()].sort((a, b) => a.getTime() - b.getTime());

    const labels = uniqueMonths.map((date) => formatMonthLabel(date, dateType, locale));
    if (locale === "fa") {
        return labels.join(" و ");
    }
    return labels.join(" and ");
}

export function buildInstallmentGenerationMessage(
    monthLabel: string,
    locale: TelegramMessageLocale = "fa",
): string {
    if (locale === "fa") {
        return (
            `📅 <b>پرداخت ماهانه ${monthLabel} ثبت شد</b>\n\n` +
            `لطفاً از طریق برنامه، پرداخت خود را انجام دهید.`
        );
    }

    return (
        `📅 <b>New monthly installment for ${monthLabel} is due</b>\n\n` +
        `Please open the app and submit your payment.`
    );
}

export function buildInstallmentGenerationButtonLabels(locale: TelegramMessageLocale = "fa") {
    if (locale === "fa") {
        return {
            telegram: "باز کردن در تلگرام",
            web: "باز کردن در مرورگر",
        };
    }

    return {
        telegram: "Open in Telegram",
        web: "Open in Browser",
    };
}
