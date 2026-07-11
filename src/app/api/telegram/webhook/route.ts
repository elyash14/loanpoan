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

        if (update.message) {
            const message = update.message as {
                chat?: { id?: number; type?: string };
                message_thread_id?: number;
                is_topic_message?: boolean;
                text?: string;
            };
            console.log(
                "[Telegram webhook]",
                JSON.stringify({
                    chat_id: message.chat?.id,
                    chat_type: message.chat?.type,
                    message_thread_id: message.message_thread_id,
                    is_topic_message: message.is_topic_message,
                    text: message.text?.slice(0, 80),
                }),
            );
        }

        await processTelegramUpdate(update);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true });
    }
}
