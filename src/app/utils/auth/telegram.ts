import { validate, parse } from "@telegram-apps/init-data-node";

export type TelegramAuthResult =
    | { ok: true; telegramId: bigint; username?: string }
    | { ok: false; code: "INVALID" | "EXPIRED" | "MISSING_TOKEN" };

export function validateTelegramInitData(initData: string): TelegramAuthResult {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        return { ok: false, code: "MISSING_TOKEN" };
    }

    try {
        validate(initData, token, { expiresIn: 3600 });
        const parsed = parse(initData);
        if (!parsed.user?.id) {
            return { ok: false, code: "INVALID" };
        }
        return {
            ok: true,
            telegramId: BigInt(parsed.user.id),
            username: parsed.user.username,
        };
    } catch {
        return { ok: false, code: "EXPIRED" };
    }
}
