"use server";

import {
    discoverTelegramChats,
    getChatAdministrators,
    getChatMember,
    getChatMemberCount,
    getMiniAppUrl,
    getTelegramGroupChatId,
    getTelegramWebhookInfo,
    setChatMenuButton,
    setTelegramWebhook,
} from "utils/telegram/botApi";
import { sanitizeWebhookSecret } from "utils/telegram/config";
import { listStoredTelegramMemberIds, upsertTelegramGroupMember } from "./data";
import { getSession } from "utils/auth/dataAccessLayer";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";

async function assertAdmin() {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function syncTelegramGroupMembers(): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
    synced?: number;
}> {
    try {
        await assertAdmin();
        const chatId = getTelegramGroupChatId();
        const seen = new Set<string>();
        let synced = 0;
        let refreshed = 0;
        let leftOrRemoved = 0;

        const administrators = await getChatAdministrators(chatId);
        for (const member of administrators) {
            if (member.user.is_bot) continue;
            await upsertTelegramGroupMember(chatId, member.user, member.status);
            seen.add(String(member.user.id));
            synced += 1;
        }

        // Refresh every stored user against the configured group.
        // Telegram bots cannot download a full member directory in one API call.
        const storedMembers = await listStoredTelegramMemberIds();
        for (const stored of storedMembers) {
            const telegramId = stored.telegramId.toString();
            if (seen.has(telegramId)) continue;

            try {
                const member = await getChatMember(chatId, stored.telegramId);
                if (member.user.is_bot) continue;

                if (member.status === "left" || member.status === "kicked") {
                    leftOrRemoved += 1;
                    continue;
                }

                await upsertTelegramGroupMember(chatId, member.user, member.status);
                seen.add(telegramId);
                refreshed += 1;
            } catch {
                // User may no longer be reachable / not in the chat
                leftOrRemoved += 1;
            }
        }

        revalidatePath(`/${DASHBOARD_URL}/telegram-members`);
        revalidatePath(`/${DASHBOARD_URL}/users`);

        const total = seen.size;
        return {
            status: "SUCCESS",
            message:
                `Synced ${total} Telegram user(s) from the group` +
                ` (${synced} admin${synced === 1 ? "" : "s"}, ${refreshed} member${refreshed === 1 ? "" : "s"} refreshed)` +
                (leftOrRemoved > 0 ? `. ${leftOrRemoved} previously stored user(s) are no longer in the group.` : ".") +
                " New members also appear when they post or join.",
            synced: total,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to sync Telegram members",
        };
    }
}

export async function getTelegramGroupStats(): Promise<{
    status: "SUCCESS" | "ERROR";
    storedCount?: number;
    groupMemberCount?: number;
    webhookUrl?: string;
    message?: string;
}> {
    try {
        await assertAdmin();
        const chatId = getTelegramGroupChatId();
        const [storedCount, groupMemberCount, webhookInfo] = await Promise.all([
            import("./data").then((m) => m.getTelegramMembersCount()),
            getChatMemberCount(chatId),
            getTelegramWebhookInfo().catch(() => ({ url: undefined })),
        ]);

        return {
            status: "SUCCESS",
            storedCount,
            groupMemberCount,
            webhookUrl: webhookInfo.url,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to load Telegram stats",
        };
    }
}

export async function registerTelegramWebhook(baseUrl: string): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
}> {
    try {
        await assertAdmin();
        const secret = sanitizeWebhookSecret(process.env.TELEGRAM_WEBHOOK_SECRET);
        const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;
        const miniAppUrl = getMiniAppUrl();
        await setTelegramWebhook(webhookUrl, secret);
        await setChatMenuButton(miniAppUrl);

        revalidatePath(`/${DASHBOARD_URL}/telegram-members`);

        return {
            status: "SUCCESS",
            message: `Webhook registered at ${webhookUrl}. Menu button set to ${miniAppUrl}`,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to register webhook",
        };
    }
}

export async function setupTelegramMenuButton(): Promise<{
    status: "SUCCESS" | "ERROR";
    message?: string;
}> {
    try {
        await assertAdmin();
        const miniAppUrl = getMiniAppUrl();
        await setChatMenuButton(miniAppUrl);
        return {
            status: "SUCCESS",
            message: `Menu button set. Open @${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME} and tap "Open App" next to the message field.`,
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to set menu button",
        };
    }
}

export async function fetchDiscoveredTelegramChats(): Promise<{
    status: "SUCCESS" | "ERROR";
    chats?: { id: string; title: string; type: string }[];
    message?: string;
}> {
    try {
        await assertAdmin();
        const webhookInfo = await getTelegramWebhookInfo().catch(() => ({ url: undefined }));
        if (webhookInfo.url) {
            return {
                status: "SUCCESS",
                chats: [],
                message:
                    "Webhook is active, so getUpdates is empty. Forward a group message to @RawDataBot and copy chat.id, or temporarily delete the webhook.",
            };
        }
        const chats = await discoverTelegramChats();
        if (!chats.length) {
            return {
                status: "SUCCESS",
                chats: [],
                message:
                    "No group chats found in recent bot updates. Post a message in your group, then try again.",
            };
        }
        return { status: "SUCCESS", chats };
    } catch (error) {
        return {
            status: "ERROR",
            message: error instanceof Error ? error.message : "Failed to discover chats",
        };
    }
}
