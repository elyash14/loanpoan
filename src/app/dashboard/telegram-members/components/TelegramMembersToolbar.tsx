'use client';

import {
    fetchDiscoveredTelegramChats,
    registerTelegramWebhook,
    setupTelegramMenuButton,
    syncTelegramGroupMembers,
} from "@database/telegram/actions";
import { Alert, Box, Button, Code, Group, List, Text } from "@mantine/core";
import { IconAppWindow, IconRefresh, IconSearch, IconWebhook } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { successNotification } from "utils/Notification/notification";

type Stats = {
    status: "SUCCESS" | "ERROR";
    storedCount?: number;
    groupMemberCount?: number;
    webhookUrl?: string;
    message?: string;
};

export default function TelegramMembersToolbar({ stats }: { stats: string }) {
    const parsed = useMemo(() => JSON.parse(stats) as Stats, [stats]);
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
    const [discoveredChats, setDiscoveredChats] = useState<
        { id: string; title: string; type: string }[] | null
    >(null);

    const runSync = () => {
        startTransition(async () => {
            const result = await syncTelegramGroupMembers();
            setMessage(result.message ?? null);
            if (result.status === "SUCCESS") {
                successNotification({ title: "Synced", message: result.message! });
                router.refresh();
            }
        });
    };

    const runWebhook = () => {
        startTransition(async () => {
            const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
                window.location.origin;
            const result = await registerTelegramWebhook(baseUrl);
            setMessage(result.message ?? null);
            if (result.status === "SUCCESS") {
                successNotification({ title: "Webhook", message: result.message! });
                router.refresh();
            }
        });
    };

    const runMenuButton = () => {
        startTransition(async () => {
            const result = await setupTelegramMenuButton();
            setMessage(result.message ?? null);
            if (result.status === "SUCCESS") {
                successNotification({ title: "Menu button", message: result.message! });
            }
        });
    };

    const runDiscover = () => {
        startTransition(async () => {
            const result = await fetchDiscoveredTelegramChats();
            setMessage(result.message ?? null);
            setDiscoveredChats(result.chats ?? []);
            if (result.status === "ERROR") {
                setDiscoveredChats(null);
            }
        });
    };

    return (
        <Box mb="md">
            <Alert mb="md" title="How member sync works">
                Telegram does not expose a full group member list to bots. This page stores members when they
                post in the group, join, or are synced as administrators. Set{" "}
                <Code>TELEGRAM_GROUP_CHAT_ID</Code> to your <strong>group</strong> chat id (usually negative,
                e.g. <Code>-1001234567890</Code>), not a user id.
            </Alert>

            {parsed.status === "SUCCESS" ? (
                <Text size="sm" c="dimmed" mb="sm">
                    Stored members: {parsed.storedCount ?? 0}
                    {parsed.groupMemberCount != null ? ` · Group size: ${parsed.groupMemberCount}` : ""}
                    {parsed.webhookUrl ? ` · Webhook: ${parsed.webhookUrl}` : " · Webhook: not set"}
                </Text>
            ) : (
                <Text size="sm" c="red" mb="sm">{parsed.message}</Text>
            )}

            <Group mb="md">
                <Button
                    leftSection={<IconRefresh size={16} />}
                    loading={pending}
                    onClick={runSync}
                >
                    Sync administrators
                </Button>
                <Button
                    variant="light"
                    leftSection={<IconWebhook size={16} />}
                    loading={pending}
                    onClick={runWebhook}
                >
                    Register webhook
                </Button>
                <Button
                    variant="light"
                    leftSection={<IconAppWindow size={16} />}
                    loading={pending}
                    onClick={runMenuButton}
                >
                    Set Open App button
                </Button>
                <Button
                    variant="default"
                    leftSection={<IconSearch size={16} />}
                    loading={pending}
                    onClick={runDiscover}
                >
                    Find group chat ID
                </Button>
            </Group>

            {discoveredChats && discoveredChats.length > 0 ? (
                <Alert mb="md" title="Copy one of these into TELEGRAM_GROUP_CHAT_ID in .env">
                    <List size="sm">
                        {discoveredChats.map((chat) => (
                            <List.Item key={chat.id}>
                                <Code>{chat.id}</Code> — {chat.title} ({chat.type})
                            </List.Item>
                        ))}
                    </List>
                </Alert>
            ) : null}

            {message ? (
                <Text c={message.includes("Failed") || message.includes("looks like") ? "red" : "dimmed"} size="sm" mb="md">
                    {message}
                </Text>
            ) : null}
        </Box>
    );
}
