import "server-only";

import { upsertTelegramGroupMember } from "@database/telegram/data";
import {
    buildGroupAppMarkup,
    getMiniAppUrl,
    getTelegramMiniAppDeepLink,
    sendTelegramMessage,
    TelegramApiUser,
} from "utils/telegram/botApi";

type TelegramUpdate = {
    message?: {
        chat: { id: number; type: string };
        from?: TelegramApiUser;
        text?: string;
        message_thread_id?: number;
        is_topic_message?: boolean;
    };
    chat_member?: {
        chat: { id: number };
        new_chat_member: {
            status: string;
            user: TelegramApiUser;
        };
    };
    my_chat_member?: {
        chat: { id: number };
        new_chat_member: {
            status: string;
            user: TelegramApiUser;
        };
    };
};

const GROUP_TYPES = new Set(["group", "supergroup"]);

function extractBotCommand(text: string | undefined): string | null {
    if (!text?.startsWith("/")) return null;
    // /app@next_financial_bot or /app
    const match = text.trim().split(/\s+/)[0]?.match(/^\/([A-Za-z0-9_]+)(?:@[\w]+)?$/);
    return match?.[1]?.toLowerCase() ?? null;
}

async function sendOpenAppInvite(chatId: number, isPrivate: boolean) {
    if (isPrivate) {
        const miniAppUrl = getMiniAppUrl();
        await sendTelegramMessage(
            chatId,
            "Welcome to PayLoop. Tap the button below to open your account.",
            {
                inline_keyboard: [[
                    {
                        text: "Open App",
                        web_app: { url: miniAppUrl },
                    },
                ]],
            },
        );
        return;
    }

    // Groups cannot use web_app buttons — use direct Mini App / web URL buttons.
    const markup = buildGroupAppMarkup({
        telegram: "Open PayLoop",
        web: "Open in browser",
    });
    const deepLink = getTelegramMiniAppDeepLink();
    const body = deepLink
        ? `Open PayLoop:\n${deepLink}`
        : "Open PayLoop from the button below.";

    await sendTelegramMessage(chatId, body, markup);
}

export async function processTelegramUpdate(update: TelegramUpdate) {
    const message = update.message;
    const command = extractBotCommand(message?.text);

    if (message?.from && message.chat.type === "private") {
        if (command === "start" || command === "app" || command === "open") {
            await sendOpenAppInvite(message.chat.id, true);
        }
        return;
    }

    if (message?.from && GROUP_TYPES.has(message.chat.type)) {
        await upsertTelegramGroupMember(
            BigInt(message.chat.id),
            message.from,
            "member",
        );

        if (command === "start" || command === "app" || command === "open") {
            await sendOpenAppInvite(message.chat.id, false);
        }
    }

    if (update.chat_member?.new_chat_member?.user) {
        const { chat, new_chat_member } = update.chat_member;
        if (new_chat_member.status !== "left" && new_chat_member.status !== "kicked") {
            await upsertTelegramGroupMember(
                BigInt(chat.id),
                new_chat_member.user,
                new_chat_member.status,
            );
        }
    }
}
