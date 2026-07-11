import "server-only";

import { sanitizeWebhookSecret, validateTelegramGroupChatId } from "./config";

export type TelegramApiUser = {
    id: number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
};

type TelegramApiResponse<T> = {
    ok: boolean;
    result?: T;
    description?: string;
};

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }
    return token;
}

export function getTelegramGroupChatId(): bigint {
    const raw = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (!raw) {
        throw new Error("TELEGRAM_GROUP_CHAT_ID is not configured");
    }
    return validateTelegramGroupChatId(raw);
}

export { getTelegramPaymentsTopicId } from "./config";

export async function callTelegramApi<T>(
    method: string,
    body?: Record<string, unknown>,
): Promise<T> {
    const token = getBotToken();
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as TelegramApiResponse<T>;
    if (!data.ok) {
        throw new Error(data.description ?? `Telegram API ${method} failed`);
    }
    return data.result as T;
}

export type ChatMember = {
    status: string;
    user: TelegramApiUser;
};

export async function getChatAdministrators(chatId: bigint): Promise<ChatMember[]> {
    return callTelegramApi<ChatMember[]>("getChatAdministrators", {
        chat_id: chatId.toString(),
    });
}

export async function getChatMemberCount(chatId: bigint): Promise<number> {
    return callTelegramApi<number>("getChatMemberCount", {
        chat_id: chatId.toString(),
    });
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
    const secret = sanitizeWebhookSecret(secretToken);
    return callTelegramApi<boolean>("setWebhook", {
        url: webhookUrl,
        ...(secret ? { secret_token: secret } : {}),
        allowed_updates: ["message", "chat_member", "my_chat_member"],
    });
}

export type TelegramUpdate = {
    update_id: number;
    message?: {
        chat: { id: number; title?: string; type: string; username?: string };
        from?: TelegramApiUser;
    };
    chat_member?: {
        chat: { id: number; title?: string; type: string; username?: string };
    };
    my_chat_member?: {
        chat: { id: number; title?: string; type: string; username?: string };
    };
};

export async function getTelegramUpdates() {
    return callTelegramApi<TelegramUpdate[]>("getUpdates", { limit: 100 });
}

export async function discoverTelegramChats() {
    const updates = await getTelegramUpdates();
    const chats = new Map<string, { id: string; title: string; type: string }>();

    for (const update of updates) {
        for (const key of ["message", "chat_member", "my_chat_member"] as const) {
            const payload = update[key];
            if (!payload?.chat) continue;
            const { chat } = payload;
            if (chat.type === "private") continue;
            const id = String(chat.id);
            chats.set(id, {
                id,
                title: chat.title ?? chat.username ?? id,
                type: chat.type,
            });
        }
    }

    return [...chats.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function getMiniAppUrl(): string {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (!base) {
        throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }
    return `${base}/home`;
}

export async function sendTelegramMessage(
    chatId: number | string,
    text: string,
    replyMarkup?: Record<string, unknown>,
    messageThreadId?: number,
    replyToMessageId?: number,
) {
    return callTelegramApi<{ message_id: number }>("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...(messageThreadId !== undefined ? { message_thread_id: messageThreadId } : {}),
        ...(replyToMessageId !== undefined ? { reply_to_message_id: replyToMessageId } : {}),
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
}

export async function sendTelegramPhoto(
    chatId: number | string,
    photoBuffer: Buffer,
    caption?: string,
    messageThreadId?: number,
    replyToMessageId?: number,
    replyMarkup?: Record<string, unknown>,
) {
    const token = getBotToken();
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    
    const blob = new Blob([new Uint8Array(photoBuffer)], { type: "image/jpeg" });
    formData.append("photo", blob, "receipt.jpg");
    
    if (caption) {
        formData.append("caption", caption);
        formData.append("parse_mode", "HTML");
    }
    if (messageThreadId !== undefined) {
        formData.append("message_thread_id", String(messageThreadId));
    }
    if (replyToMessageId !== undefined) {
        formData.append("reply_to_message_id", String(replyToMessageId));
    }
    if (replyMarkup) {
        formData.append("reply_markup", JSON.stringify(replyMarkup));
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: formData,
    });

    const data = (await response.json()) as TelegramApiResponse<{
        message_id: number;
        photo?: Array<{ file_id: string }>;
    }>;
    if (!data.ok) {
        throw new Error(data.description ?? "Telegram API sendPhoto failed");
    }
    const photos = data.result?.photo ?? [];
    const fileId = photos.length > 0 ? photos[photos.length - 1].file_id : undefined;
    return {
        message_id: data.result!.message_id,
        file_id: fileId,
    };
}

export async function fetchTelegramFile(fileId: string): Promise<{ buffer: Buffer; contentType: string }> {
    const file = await callTelegramApi<{ file_path: string }>("getFile", { file_id: fileId });
    const token = getBotToken();
    const response = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
    if (!response.ok) {
        throw new Error("Failed to download file from Telegram");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    return { buffer, contentType };
}

export async function setChatMenuButton(miniAppUrl?: string) {
    const url = miniAppUrl ?? getMiniAppUrl();
    return callTelegramApi<boolean>("setChatMenuButton", {
        menu_button: {
            type: "web_app",
            text: "Open App",
            web_app: { url },
        },
    });
}

export async function getTelegramWebhookInfo() {
    return callTelegramApi<{
        url?: string;
        has_custom_certificate?: boolean;
        pending_update_count?: number;
    }>("getWebhookInfo");
}
