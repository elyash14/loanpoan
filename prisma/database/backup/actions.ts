"use server";

import prisma from "@database/prisma";
import { getGlobalConfigs } from "@database/config/data";
import { revalidatePath, updateTag } from "next/cache";
import { getSession } from "utils/auth/dataAccessLayer";
import { DASHBOARD_URL } from "utils/configs";
import { sendTelegramDocument } from "utils/telegram/botApi";
import { validateTelegramGroupChatId } from "utils/telegram/config";
import { GlobalConfigType } from "utils/types/configs";
import {
    createDatabaseDumpFile,
    deleteBackupFile,
    getBackupFile,
    listBackupFiles,
    BackupFileInfo,
} from "./data";

async function assertAdmin() {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

export async function getEffectiveBackupTopicId(): Promise<number | undefined> {
    try {
        const config = ((await getGlobalConfigs()) as GlobalConfigType) || {};
        if (config.backup?.telegramTopicId !== undefined && config.backup?.telegramTopicId !== null) {
            return config.backup.telegramTopicId;
        }
        if (config.telegram?.backupTopicId !== undefined && config.telegram?.backupTopicId !== null) {
            return config.telegram.backupTopicId;
        }
    } catch {
        // Fall back to env variables
    }

    const envBackupTopic = process.env.TELEGRAM_BACKUP_TOPIC_ID?.trim();
    if (envBackupTopic) {
        const parsed = Number(envBackupTopic);
        if (!isNaN(parsed)) return parsed;
    }

    const envPaymentsTopic = process.env.TELEGRAM_PAYMENTS_TOPIC_ID?.trim();
    if (envPaymentsTopic) {
        const parsed = Number(envPaymentsTopic);
        if (!isNaN(parsed)) return parsed;
    }

    return undefined;
}

export type BackupOverviewData = {
    status: "SUCCESS" | "ERROR";
    databaseConfigured: boolean;
    databaseName?: string;
    telegramBotConfigured: boolean;
    telegramGroupConfigured: boolean;
    telegramGroupChatId?: string;
    telegramTopicId?: number;
    savedBackupTopicId?: number | null;
    backups: BackupFileInfo[];
    message?: string;
};

export async function getBackupOverviewAction(): Promise<BackupOverviewData> {
    try {
        await assertAdmin();

        const dbUrl = process.env.DATABASE_URL;
        let databaseName: string | undefined;
        if (dbUrl) {
            try {
                const url = new URL(dbUrl.split("?")[0]);
                databaseName = url.pathname.replace(/^\//, "") || "postgres";
            } catch {
                databaseName = "PostgreSQL";
            }
        }

        const telegramBotConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
        const rawGroup = process.env.TELEGRAM_GROUP_CHAT_ID?.trim();
        const telegramGroupConfigured = Boolean(rawGroup);

        const config = ((await getGlobalConfigs()) as GlobalConfigType) || {};
        const savedTopicId =
            config.backup?.telegramTopicId ?? config.telegram?.backupTopicId ?? null;
        const effectiveTopicId = await getEffectiveBackupTopicId();

        const backups = await listBackupFiles();

        return {
            status: "SUCCESS",
            databaseConfigured: Boolean(dbUrl),
            databaseName,
            telegramBotConfigured,
            telegramGroupConfigured,
            telegramGroupChatId: rawGroup,
            telegramTopicId: effectiveTopicId,
            savedBackupTopicId: savedTopicId,
            backups,
        };
    } catch (error) {
        return {
            status: "ERROR",
            databaseConfigured: false,
            telegramBotConfigured: false,
            telegramGroupConfigured: false,
            backups: [],
            message: error instanceof Error ? error.message : "Failed to load backup data",
        };
    }
}

export async function saveBackupTopicAction(topicId: number | null): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
    topicId?: number | null;
}> {
    try {
        await assertAdmin();

        const config = ((await getGlobalConfigs()) as GlobalConfigType) || {};
        const newConfig: GlobalConfigType = {
            ...config,
            backup: {
                ...config.backup,
                telegramTopicId: topicId,
            },
        };

        await prisma.config.upsert({
            where: {
                name: "global",
            },
            update: {
                value: newConfig,
            },
            create: {
                name: "global",
                value: newConfig,
            },
        });

        updateTag("global-config");
        revalidatePath(`/${DASHBOARD_URL}/configs/backup`);

        return {
            status: "SUCCESS",
            message:
                topicId !== null && topicId !== undefined
                    ? `Backup topic/thread ID saved: ${topicId}`
                    : "Backup topic/thread ID cleared (backups will be sent to general topic).",
            topicId,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to save backup topic ID",
        };
    }
}

export async function createDatabaseBackupAction(): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
    backup?: BackupFileInfo;
}> {
    try {
        await assertAdmin();
        const backup = await createDatabaseDumpFile();

        revalidatePath(`/${DASHBOARD_URL}/configs/backup`);

        return {
            status: "SUCCESS",
            message: `Backup created successfully (${backup.filename}, ${backup.sizeFormatted}).`,
            backup,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to create database backup",
        };
    }
}

export async function sendBackupToTelegramAction(params?: {
    filename?: string;
    customChatId?: string;
    customTopicId?: string;
}): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
    telegramMessageId?: number;
}> {
    try {
        await assertAdmin();

        // 1. Resolve or create backup file
        let backupInfo: BackupFileInfo;
        let fileBuffer: Buffer;

        if (params?.filename) {
            const fileData = await getBackupFile(params.filename);
            backupInfo = fileData.info;
            fileBuffer = fileData.buffer;
        } else {
            backupInfo = await createDatabaseDumpFile();
            const fileData = await getBackupFile(backupInfo.filename);
            fileBuffer = fileData.buffer;
        }

        // 2. Resolve destination Telegram Chat ID
        const targetChatRaw = params?.customChatId?.trim() || process.env.TELEGRAM_GROUP_CHAT_ID?.trim();
        if (!targetChatRaw) {
            throw new Error(
                "No Telegram Chat ID configured. Set TELEGRAM_GROUP_CHAT_ID in .env or provide a destination Chat ID.",
            );
        }
        const targetChatId = validateTelegramGroupChatId(targetChatRaw);

        // 3. Resolve Topic ID if applicable
        let targetTopicId: number | undefined;
        if (params?.customTopicId !== undefined && params.customTopicId.trim() !== "") {
            const parsedTopic = Number(params.customTopicId.trim());
            if (!isNaN(parsedTopic)) {
                targetTopicId = parsedTopic;
            }
        } else {
            targetTopicId = await getEffectiveBackupTopicId();
        }

        // 4. Construct message caption
        const appName = process.env.NEXT_PUBLIC_APP_URL || "PayLoop";
        const dateStr = new Date(backupInfo.createdAt).toUTCString();
        const caption = [
            `📦 <b>Database Backup</b>`,
            `🏷 <b>App:</b> ${appName}`,
            `📅 <b>Date:</b> ${dateStr}`,
            `📁 <b>File:</b> <code>${backupInfo.filename}</code>`,
            `💾 <b>Size:</b> ${backupInfo.sizeFormatted}`,
            `🔒 <b>Format:</b> PostgreSQL Custom Archive (.dump)`,
            ``,
            `⚡ <b>To restore:</b>`,
            `<code>pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" ${backupInfo.filename}</code>`,
        ].join("\n");

        // 5. Send document to Telegram
        const result = await sendTelegramDocument(
            targetChatId,
            fileBuffer,
            backupInfo.filename,
            caption,
            targetTopicId,
        );

        revalidatePath(`/${DASHBOARD_URL}/configs/backup`);

        return {
            status: "SUCCESS",
            message: `Backup ${backupInfo.filename} (${backupInfo.sizeFormatted}) sent to Telegram successfully.`,
            telegramMessageId: result.message_id,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to send backup to Telegram",
        };
    }
}

export async function createAndSendBackupAction(params?: {
    customChatId?: string;
    customTopicId?: string;
}): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
    backup?: BackupFileInfo;
    telegramMessageId?: number;
}> {
    try {
        await assertAdmin();

        // Create new backup
        const backup = await createDatabaseDumpFile();

        // Send to Telegram
        const sendResult = await sendBackupToTelegramAction({
            filename: backup.filename,
            customChatId: params?.customChatId,
            customTopicId: params?.customTopicId,
        });

        if (sendResult.status === "ERROR") {
            return {
                status: "ERROR",
                message: `Backup created (${backup.filename}) but sending to Telegram failed: ${sendResult.message}`,
                backup,
            };
        }

        revalidatePath(`/${DASHBOARD_URL}/configs/backup`);

        return {
            status: "SUCCESS",
            message: `Database backup created (${backup.sizeFormatted}) and sent to Telegram successfully!`,
            backup,
            telegramMessageId: sendResult.telegramMessageId,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to create and send backup",
        };
    }
}

export async function deleteBackupAction(filename: string): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
}> {
    try {
        await assertAdmin();
        const deleted = await deleteBackupFile(filename);

        revalidatePath(`/${DASHBOARD_URL}/configs/backup`);

        if (deleted) {
            return {
                status: "SUCCESS",
                message: `Backup file ${filename} deleted successfully.`,
            };
        }

        return {
            status: "ERROR",
            message: `Backup file ${filename} was not found.`,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to delete backup file",
        };
    }
}
