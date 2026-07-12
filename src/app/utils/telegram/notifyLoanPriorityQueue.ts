import "server-only";

import { getGlobalConfigs } from "@database/config/data";
import { getLoanPriorityQueue } from "@database/loan/queue";
import type { GlobalConfigType } from "utils/types/configs";
import {
    buildGroupAppMarkup,
    getTelegramGroupChatId,
    sendTelegramMessage,
} from "./botApi";
import { resolveTelegramMessageLocale } from "./paymentRequestMessages";

function buildQueueButtonLabels(locale: "en" | "fa") {
    if (locale === "fa") {
        return {
            telegram: "مشاهده صف در برنامه",
            web: "باز کردن در مرورگر",
        };
    }
    return {
        telegram: "Open Priority Queue",
        web: "Open in Browser",
    };
}

export async function notifyLoanPriorityQueue(): Promise<void> {
    try {
        const config = (await getGlobalConfigs()) as GlobalConfigType;
        const locale = resolveTelegramMessageLocale(config);

        const queue = await getLoanPriorityQueue();
        if (queue.length === 0) {
            return;
        }

        let text = "";
        if (locale === "fa") {
            text += `📋 <b>لیست نوبت‌های انتظار دریافت وام</b>\n\n`;
            queue.forEach((entry) => {
                text += `<b>${entry.position}.</b> ${entry.userFullName} (کد حساب: ${entry.accountCode})\n`;
            });
            text += `\nلطفاً برای اطلاعات بیشتر برنامه را باز کنید.`;
        } else {
            text += `📋 <b>Loan Priority Queue</b>\n\n`;
            queue.forEach((entry) => {
                text += `<b>${entry.position}.</b> ${entry.userFullName} (Account: ${entry.accountCode})\n`;
            });
            text += `\nPlease open the app for more details.`;
        }

        const chatId = getTelegramGroupChatId();
        await sendTelegramMessage(
            chatId.toString(),
            text,
            buildGroupAppMarkup(buildQueueButtonLabels(locale)),
        );
    } catch (error) {
        console.error("Failed to send loan priority queue Telegram notification:", error);
    }
}
