import { validate, parse } from "@telegram-apps/init-data-node";

export type TelegramAuthResult =
    | {
          ok: true;
          telegramId: bigint;
          username?: string;
          firstName?: string;
          lastName?: string;
      }
    | { ok: false; code: "INVALID" | "EXPIRED" | "MISSING_TOKEN" };

export function validateTelegramInitData(initData: string): TelegramAuthResult {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        return { ok: false, code: "MISSING_TOKEN" };
    }

    try {
        validate(initData, token, { expiresIn: 3600 });
        const parsed = parse(initData);
        const user = parsed.user as
            | {
                  id: number;
                  username?: string;
                  firstName?: string;
                  lastName?: string;
                  first_name?: string;
                  last_name?: string;
              }
            | undefined;

        if (!user?.id) {
            return { ok: false, code: "INVALID" };
        }

        return {
            ok: true,
            telegramId: BigInt(user.id),
            username: user.username,
            firstName: user.firstName ?? user.first_name,
            lastName: user.lastName ?? user.last_name,
        };
    } catch {
        return { ok: false, code: "EXPIRED" };
    }
}
