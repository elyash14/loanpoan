import { createSession } from "utils/auth/session";
import { validateTelegramInitData } from "utils/auth/telegram";
import { getUserByTelegramId, recordUserLastLogin } from "@database/user/data";
import { NextResponse } from "next/server";

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

    const user = await getUserByTelegramId(result.telegramId);
    if (!user || user.deletedAt) {
        return NextResponse.json({ code: "NOT_LINKED" }, { status: 403 });
    }

    await recordUserLastLogin(user.id);
    await createSession(user, "telegram");

    return NextResponse.json({ ok: true, userId: user.id });
}
