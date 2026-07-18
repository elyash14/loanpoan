import { createSession } from "utils/auth/session";
import { validateTelegramInitData } from "utils/auth/telegram";
import { getUserByTelegramId, recordUserLastLogin } from "@database/user/data";
import { upsertTelegramGroupMember } from "@database/telegram/data";
import { getTelegramGroupChatId } from "utils/telegram/botApi";
import prisma from "@database/prisma";
import { NextResponse } from "next/server";

/**
 * Persist anyone who opens the Mini App into TelegramGroupMember,
 * so admins can link them without requiring a group message first.
 */
async function recordMiniAppVisitor(auth: {
    telegramId: bigint;
    username?: string;
    firstName?: string;
    lastName?: string;
}) {
    try {
        const chatId = getTelegramGroupChatId();
        await upsertTelegramGroupMember(
            chatId,
            {
                id: Number(auth.telegramId),
                username: auth.username,
                first_name: auth.firstName,
                last_name: auth.lastName,
            },
            "mini_app",
            { preserveExistingStatus: true },
        );
    } catch (error) {
        // TELEGRAM_GROUP_CHAT_ID may be missing; auth should still continue.
        console.error("Failed to record Mini App visitor:", error);
    }
}

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization") ?? "";
    const [authType, authData] = authHeader.split(" ");

    if (authType !== "tma" || !authData) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = validateTelegramInitData(authData);
    if (!result.ok) {
        return NextResponse.json({ error: result.code }, { status: 401 });
    }

    await recordMiniAppVisitor(result);

    const user = await getUserByTelegramId(result.telegramId);
    if (!user || user.deletedAt) {
        return NextResponse.json(
            {
                code: "NOT_LINKED",
                telegramId: result.telegramId.toString(),
                username: result.username ?? null,
            },
            { status: 403 },
        );
    }

    // Keep linked username in sync when the person opens the Mini App again.
    if ((result.username ?? null) !== (user.telegramUsername ?? null)) {
        await prisma.user.update({
            where: { id: user.id },
            data: { telegramUsername: result.username ?? null },
        });
    }

    await recordUserLastLogin(user.id);
    await createSession(user, "telegram");

    return NextResponse.json({ ok: true, userId: user.id });
}
