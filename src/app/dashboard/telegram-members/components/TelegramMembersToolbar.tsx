'use client';

import {
    fetchDiscoveredTelegramChats,
    postOpenAppToTelegramGroup,
    registerTelegramBotCommands,
    registerTelegramWebhook,
    setupTelegramMenuButton,
    syncTelegramGroupMembers,
} from "@database/telegram/actions";
import { Alert, Box, Button, Code, Group, List, Text } from "@mantine/core";
import {
    IconAppWindow,
    IconListDetails,
    IconRefresh,
    IconSearch,
    IconSend,
    IconWebhook,
} from "@tabler/icons-react";
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

    const runRegisterCommands = () => {
        startTransition(async () => {
            const result = await registerTelegramBotCommands();
            setMessage(result.message ?? null);
            if (result.status === "SUCCESS") {
                successNotification({ title: "Commands", message: result.message! });
            }
        });
    };

    const runPostOpenApp = () => {
        startTransition(async () => {
            const result = await postOpenAppToTelegramGroup();
            setMessage(result.message ?? null);
            if (result.status === "SUCCESS") {
                successNotification({ title: "Posted", message: result.message! });
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
                Telegram bots cannot download a complete group directory in one request.{" "}
                <strong>Sync telegram users</strong> finds administrators and refreshes every stored member
                still in the group. People also appear when they <strong>open the Mini App</strong>, post in
                the group, or join. In the group, members can type <Code>/app</Code> (or use the{" "}
                <Code>/</Code> menu) to get an Open PayLoop button. Set <Code>TELEGRAM_GROUP_CHAT_ID</Code>{" "}
                to your <strong>group</strong> chat id (usually negative, e.g.{" "}
                <Code>-1001234567890</Code>), not a user id.
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
                    Sync telegram users
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
                    variant="light"
                    leftSection={<IconListDetails size={16} />}
                    loading={pending}
                    onClick={runRegisterCommands}
                >
                    Register /app commands
                </Button>
                <Button
                    variant="light"
                    leftSection={<IconSend size={16} />}
                    loading={pending}
                    onClick={runPostOpenApp}
                >
                    Post Open App to group
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
                <Text c={message.includes("Failed") || message.includes("looks like") || message.includes("not configured") ? "red" : "dimmed"} size="sm" mb="md">
                    {message}
                </Text>
            ) : null}
        </Box>
    );
}
