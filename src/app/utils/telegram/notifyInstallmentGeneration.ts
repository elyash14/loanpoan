import "server-only";

import { getGlobalConfigs } from "@database/config/data";
import type { GlobalConfigType } from "utils/types/configs";
import {
    buildGroupAppMarkup,
    getTelegramGroupChatId,
    sendTelegramMessage,
} from "./botApi";
import {
    buildInstallmentGenerationButtonLabels,
    buildInstallmentGenerationMessage,
    formatInstallmentMonths,
} from "./installmentGenerationMessages";
import { resolveTelegramMessageLocale } from "./paymentRequestMessages";

export async function notifyInstallmentGeneration(
    createdCount: number,
    dueDates: Date[],
): Promise<void> {
    if (createdCount === 0) {
        return;
    }

    try {
        const config = (await getGlobalConfigs()) as GlobalConfigType;
        const locale = resolveTelegramMessageLocale(config);
        const dateType = config.dateType ?? "JALALI";
        const monthLabel = formatInstallmentMonths(dueDates, dateType, locale);
        if (!monthLabel) {
            return;
        }

        const text = buildInstallmentGenerationMessage(monthLabel, locale);
        const chatId = getTelegramGroupChatId();

        await sendTelegramMessage(
            chatId.toString(),
            text,
            buildGroupAppMarkup(buildInstallmentGenerationButtonLabels(locale)),
        );
    } catch (error) {
        console.error("Failed to send installment generation Telegram notification:", error);
    }
}
