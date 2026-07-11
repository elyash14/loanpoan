import type { GlobalConfigType } from "utils/types/configs";
import { formatMoney } from "utils/formatMoney";

export type TelegramMessageLocale = "en" | "fa";

export function resolveTelegramMessageLocale(config?: GlobalConfigType): TelegramMessageLocale {
    return config?.telegramMessageLocale === "en" ? "en" : "fa";
}

type PaymentRequestItem = {
    id: number;
    amount: number;
};

type NewPaymentRequestParams = {
    requestId: number;
    fullName: string;
    amount: number;
    installments: PaymentRequestItem[];
    payments: PaymentRequestItem[];
};

function formatItemLines(items: PaymentRequestItem[], locale: TelegramMessageLocale): string {
    return items
        .map((item) => {
            const formattedAmount = formatMoney(item.amount, locale);
            if (locale === "fa") {
                return `   • شناسه ${item.id} — ${formattedAmount}`;
            }
            return `   • ID ${item.id} — ${formattedAmount}`;
        })
        .join("\n");
}

export function buildPaymentRequestCaption(
    params: NewPaymentRequestParams,
    locale: TelegramMessageLocale = "fa",
): string {
    const { requestId, fullName, amount, installments, payments } = params;
    const formattedAmount = formatMoney(amount, locale);

    let detailsText = "";
    if (installments.length > 0) {
        if (locale === "fa") {
            detailsText += `🔹 <b>پرداخت‌های ماهانه:</b>\n${formatItemLines(installments, locale)}\n`;
        } else {
            detailsText += `🔹 <b>Installments:</b>\n${formatItemLines(installments, locale)}\n`;
        }
    }
    if (payments.length > 0) {
        if (locale === "fa") {
            detailsText += `🔹 <b>اقساط وام:</b>\n${formatItemLines(payments, locale)}\n`;
        } else {
            detailsText += `🔹 <b>Loan Payments:</b>\n${formatItemLines(payments, locale)}\n`;
        }
    }

    if (locale === "fa") {
        return (
            `📝 <b>درخواست پرداخت جدید #${requestId}</b>\n\n` +
            `👤 <b>کاربر:</b> ${fullName}\n` +
            `💰 <b>مبلغ:</b> ${formattedAmount}\n\n` +
            `📋 <b>جزئیات:</b>\n${detailsText}\n` +
            `لطفاً این درخواست را در پنل مدیریت بررسی کنید.`
        );
    }

    return (
        `📝 <b>New Payment Request #${requestId}</b>\n\n` +
        `👤 <b>User:</b> ${fullName}\n` +
        `💰 <b>Amount:</b> ${formattedAmount}\n\n` +
        `📋 <b>Details:</b>\n${detailsText}\n` +
        `Please review this request in the admin dashboard.`
    );
}

type ReviewPaymentRequestParams = {
    requestId: number;
    status: "APPROVED" | "REJECTED";
    fullName: string;
    amount: number;
};

export function buildPaymentRequestReviewMessage(
    params: ReviewPaymentRequestParams,
    locale: TelegramMessageLocale = "fa",
): string {
    const { requestId, status, fullName, amount } = params;
    const formattedAmount = formatMoney(amount, locale);
    const statusEmoji = status === "APPROVED" ? "✅" : "❌";

    if (locale === "fa") {
        const statusText = status === "APPROVED" ? "تأیید شد" : "رد شد";
        return (
            `${statusEmoji} <b>درخواست پرداخت #${requestId} ${statusText}</b>\n\n` +
            `👤 <b>کاربر:</b> ${fullName}\n` +
            `💰 <b>مبلغ:</b> ${formattedAmount}\n\n` +
            `توسط مدیر بررسی شد.`
        );
    }

    const statusText = status === "APPROVED" ? "APPROVED" : "REJECTED";
    return (
        `${statusEmoji} <b>Payment Request #${requestId} ${statusText}</b>\n\n` +
        `👤 <b>User:</b> ${fullName}\n` +
        `💰 <b>Amount:</b> ${formattedAmount}\n\n` +
        `Reviewed by Administrator.`
    );
}
