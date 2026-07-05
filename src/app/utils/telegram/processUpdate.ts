import "server-only";

import { upsertTelegramGroupMember } from "@database/telegram/data";
import { getMiniAppUrl, sendTelegramMessage, TelegramApiUser } from "utils/telegram/botApi";

type TelegramUpdate = {
    message?: {
        chat: { id: number; type: string };
        from?: TelegramApiUser;
        text?: string;
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

export async function processTelegramUpdate(update: TelegramUpdate) {
    const message = update.message;

    if (message?.chat.type === "private" && message.from) {
        if (message.text?.startsWith("/start")) {
            const miniAppUrl = getMiniAppUrl();
            await sendTelegramMessage(
                message.chat.id,
                "Welcome to Next Financial. Tap the button below to open your account.",
                {
                    inline_keyboard: [[
                        {
                            text: "Open App",
                            web_app: { url: miniAppUrl },
                        },
                    ]],
                },
            );
        }
        return;
    }

    if (message?.from && GROUP_TYPES.has(message.chat.type)) {
        await upsertTelegramGroupMember(
            BigInt(message.chat.id),
            message.from,
            "member",
        );
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
