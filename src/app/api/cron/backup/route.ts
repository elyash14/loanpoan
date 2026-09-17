import {
    createDatabaseDumpFile,
    getBackupFile,
} from "@database/backup/data";
import { getEffectiveBackupTopicId } from "@database/backup/actions";
import { sendTelegramDocument } from "utils/telegram/botApi";
import { validateTelegramGroupChatId } from "utils/telegram/config";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization") ?? "";
    const [authType, token] = authHeader.split(" ");

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET environment variable is not defined");
        return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    if (authType !== "Bearer" || !token || token !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rawGroup = process.env.TELEGRAM_GROUP_CHAT_ID?.trim();
        if (!rawGroup) {
            return NextResponse.json(
                { error: "TELEGRAM_GROUP_CHAT_ID is not configured" },
                { status: 400 },
            );
        }

        const targetChatId = validateTelegramGroupChatId(rawGroup);
        const targetTopicId = await getEffectiveBackupTopicId();

        // 1. Create dump file
        const backupInfo = await createDatabaseDumpFile();
        const { buffer } = await getBackupFile(backupInfo.filename);

        // 2. Prepare Telegram caption
        const appName = process.env.NEXT_PUBLIC_APP_URL || "PayLoop";
        const dateStr = new Date(backupInfo.createdAt).toUTCString();
        const caption = [
            `📦 <b>Automated Database Backup</b>`,
            `🏷 <b>App:</b> ${appName}`,
            `📅 <b>Date:</b> ${dateStr}`,
            `📁 <b>File:</b> <code>${backupInfo.filename}</code>`,
            `💾 <b>Size:</b> ${backupInfo.sizeFormatted}`,
            `🔒 <b>Format:</b> PostgreSQL Custom Archive (.dump)`,
            ``,
            `⚡ <b>To restore:</b>`,
            `<code>pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" ${backupInfo.filename}</code>`,
        ].join("\n");

        // 3. Send to Telegram
        const telegramResult = await sendTelegramDocument(
            targetChatId,
            buffer,
            backupInfo.filename,
            caption,
            targetTopicId,
        );

        return NextResponse.json({
            success: true,
            message: `Automated backup created and sent to Telegram (${backupInfo.filename}, ${backupInfo.sizeFormatted})`,
            backup: backupInfo,
            telegramMessageId: telegramResult.message_id,
        });
    } catch (error: any) {
        console.error("Error in automated backup cron endpoint:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 },
        );
    }
}
