import { processTelegramUpdate } from "utils/telegram/processUpdate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
        const header = request.headers.get("x-telegram-bot-api-secret-token");
        if (header !== secret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const update = await request.json();
        await processTelegramUpdate(update);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true });
    }
}
