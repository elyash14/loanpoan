/** Telegram secret_token: only A-Z, a-z, 0-9, underscore, hyphen; 1-256 chars */
const WEBHOOK_SECRET_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

export function sanitizeWebhookSecret(secret: string | undefined): string | undefined {
    if (!secret?.trim()) return undefined;
    const trimmed = secret.trim();
    if (!WEBHOOK_SECRET_PATTERN.test(trimmed)) {
        throw new Error(
            "TELEGRAM_WEBHOOK_SECRET may only contain letters, numbers, underscore, and hyphen (no &, spaces, etc.)",
        );
    }
    return trimmed;
}

export function validateTelegramGroupChatId(raw: string): bigint {
    const chatId = BigInt(raw);
    if (chatId > 0n && chatId < 1_000_000_000_000n) {
        throw new Error(
            `TELEGRAM_GROUP_CHAT_ID=${raw} looks like a user ID, not a group. ` +
            "Forward a message from your group to @RawDataBot and use chat.id (usually starts with -100).",
        );
    }
    return chatId;
}
