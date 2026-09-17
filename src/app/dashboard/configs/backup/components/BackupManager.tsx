"use client";

import {
    BackupOverviewData,
    createAndSendBackupAction,
    createDatabaseBackupAction,
    deleteBackupAction,
    getBackupOverviewAction,
    saveBackupTopicAction,
    sendBackupToTelegramAction,
} from "@database/backup/actions";
import { BackupFileInfo } from "@database/backup/data";
import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Code,
    Divider,
    Group,
    Modal,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    Tooltip,
    rem,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconBrandTelegram,
    IconCheck,
    IconCloudUpload,
    IconDatabase,
    IconDeviceFloppy,
    IconDownload,
    IconFileDatabase,
    IconHash,
    IconRefresh,
    IconSend,
    IconSettings,
    IconTerminal2,
    IconTrash,
} from "@tabler/icons-react";
import { useMemo, useState, useTransition } from "react";
import { errorNotification, successNotification } from "utils/Notification/notification";

type Props = {
    initialData: string;
};

export default function BackupManager({ initialData }: Props) {
    const [overview, setOverview] = useState<BackupOverviewData>(() =>
        JSON.parse(initialData),
    );
    const [pending, startTransition] = useTransition();

    const [activeAction, setActiveAction] = useState<
        "backup_send" | "backup_only" | "refresh" | "send_item" | "delete_item" | "save_topic" | null
    >(null);
    const [activeFilename, setActiveFilename] = useState<string | null>(null);

    // Topic / Thread ID state
    const [topicInput, setTopicInput] = useState<string>(() => {
        if (overview.savedBackupTopicId !== undefined && overview.savedBackupTopicId !== null) {
            return String(overview.savedBackupTopicId);
        }
        if (overview.telegramTopicId !== undefined && overview.telegramTopicId !== null) {
            return String(overview.telegramTopicId);
        }
        return "";
    });

    // Single-shot override settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customChatId, setCustomChatId] = useState("");
    const [customTopicId, setCustomTopicId] = useState("");

    // Delete modal confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);

    const refreshData = () => {
        setActiveAction("refresh");
        startTransition(async () => {
            const data = await getBackupOverviewAction();
            if (data.status === "SUCCESS") {
                setOverview(data);
                if (data.savedBackupTopicId !== undefined && data.savedBackupTopicId !== null) {
                    setTopicInput(String(data.savedBackupTopicId));
                }
                successNotification({
                    title: "Updated",
                    message: "Backup list refreshed successfully.",
                });
            } else {
                errorNotification({
                    title: "Error",
                    message: data.message || "Failed to refresh backups.",
                });
            }
            setActiveAction(null);
        });
    };

    const handleSaveTopicId = () => {
        const raw = topicInput.trim();
        let parsed: number | null = null;
        if (raw !== "") {
            parsed = Number(raw);
            if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
                errorNotification({
                    title: "Invalid Topic ID",
                    message: "Topic (Thread) ID must be a positive integer number (e.g. 42).",
                });
                return;
            }
        }

        setActiveAction("save_topic");
        startTransition(async () => {
            const res = await saveBackupTopicAction(parsed);
            if (res.status === "SUCCESS") {
                successNotification({
                    title: "Topic Saved",
                    message: res.message || "Backup Topic / Thread ID updated.",
                });
                const updated = await getBackupOverviewAction();
                if (updated.status === "SUCCESS") setOverview(updated);
            } else {
                errorNotification({
                    title: "Save Failed",
                    message: res.message || "Failed to save topic ID.",
                });
            }
            setActiveAction(null);
        });
    };

    const handleCreateAndSend = () => {
        setActiveAction("backup_send");
        startTransition(async () => {
            const res = await createAndSendBackupAction({
                customChatId: customChatId.trim() || undefined,
                customTopicId: customTopicId.trim() || undefined,
            });

            if (res.status === "SUCCESS") {
                successNotification({
                    title: "Backup Sent",
                    message: res.message || "Backup created and sent to Telegram!",
                });
                const updated = await getBackupOverviewAction();
                if (updated.status === "SUCCESS") setOverview(updated);
            } else {
                errorNotification({
                    title: "Backup Failed",
                    message: res.message || "Could not complete backup.",
                });
                const updated = await getBackupOverviewAction();
                if (updated.status === "SUCCESS") setOverview(updated);
            }
            setActiveAction(null);
        });
    };

    const handleCreateOnly = () => {
        setActiveAction("backup_only");
        startTransition(async () => {
            const res = await createDatabaseBackupAction();

            if (res.status === "SUCCESS") {
                successNotification({
                    title: "Backup Created",
                    message: res.message || "Local backup file created successfully.",
                });
                const updated = await getBackupOverviewAction();
                if (updated.status === "SUCCESS") setOverview(updated);
            } else {
                errorNotification({
                    title: "Backup Failed",
                    message: res.message || "Could not create backup.",
                });
            }
            setActiveAction(null);
        });
    };

    const handleSendExistingFile = (filename: string) => {
        setActiveAction("send_item");
        setActiveFilename(filename);
        startTransition(async () => {
            const res = await sendBackupToTelegramAction({
                filename,
                customChatId: customChatId.trim() || undefined,
                customTopicId: customTopicId.trim() || undefined,
            });

            if (res.status === "SUCCESS") {
                successNotification({
                    title: "Sent to Telegram",
                    message: res.message || `File ${filename} sent to Telegram.`,
                });
            } else {
                errorNotification({
                    title: "Send Failed",
                    message: res.message || "Could not send file to Telegram.",
                });
            }
            setActiveAction(null);
            setActiveFilename(null);
        });
    };

    const confirmDelete = (filename: string) => {
        setFileToDelete(filename);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!fileToDelete) return;
        const filename = fileToDelete;
        setDeleteModalOpen(false);
        setFileToDelete(null);

        setActiveAction("delete_item");
        setActiveFilename(filename);
        startTransition(async () => {
            const res = await deleteBackupAction(filename);

            if (res.status === "SUCCESS") {
                successNotification({
                    title: "Deleted",
                    message: res.message || `File ${filename} was deleted.`,
                });
                const updated = await getBackupOverviewAction();
                if (updated.status === "SUCCESS") setOverview(updated);
            } else {
                errorNotification({
                    title: "Delete Failed",
                    message: res.message || "Could not delete file.",
                });
            }
            setActiveAction(null);
            setActiveFilename(null);
        });
    };

    const isTelegramReady = overview.telegramBotConfigured && overview.telegramGroupConfigured;

    const backupRows = useMemo(() => {
        if (!overview.backups || overview.backups.length === 0) {
            return null;
        }

        return overview.backups.map((item: BackupFileInfo) => {
            const isSendingThis = activeAction === "send_item" && activeFilename === item.filename;
            const isDeletingThis = activeAction === "delete_item" && activeFilename === item.filename;
            const downloadUrl = `/api/dashboard/backup/${encodeURIComponent(item.filename)}`;
            const formattedDate = new Date(item.createdAt).toLocaleString();

            return (
                <Table.Tr key={item.filename}>
                    <Table.Td>
                        <Group gap="xs">
                            <IconFileDatabase size={18} color="var(--mantine-color-blue-filled)" />
                            <Text size="sm" fw={500}>
                                {item.filename}
                            </Text>
                        </Group>
                    </Table.Td>
                    <Table.Td>
                        <Badge variant="light" color="blue" size="sm">
                            {item.sizeFormatted}
                        </Badge>
                    </Table.Td>
                    <Table.Td>
                        <Text size="xs" c="dimmed">
                            {formattedDate}
                        </Text>
                    </Table.Td>
                    <Table.Td>
                        <Group gap="xs" justify="flex-end">
                            <Tooltip label="Download file to computer">
                                <ActionIcon
                                    component="a"
                                    href={downloadUrl}
                                    download={item.filename}
                                    variant="subtle"
                                    color="blue"
                                    size="md"
                                >
                                    <IconDownload size={16} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Send this backup to Telegram">
                                <ActionIcon
                                    variant="subtle"
                                    color="teal"
                                    size="md"
                                    loading={isSendingThis}
                                    disabled={pending}
                                    onClick={() => handleSendExistingFile(item.filename)}
                                >
                                    <IconSend size={16} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Delete backup file">
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="md"
                                    loading={isDeletingThis}
                                    disabled={pending}
                                    onClick={() => confirmDelete(item.filename)}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Table.Td>
                </Table.Tr>
            );
        });
    }, [overview.backups, activeAction, activeFilename, pending]);

    return (
        <Stack gap="lg">
            {/* Status Overview Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card withBorder padding="md" radius="md">
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconDatabase size={20} color="var(--mantine-color-blue-filled)" />
                            <Text fw={600} size="sm">
                                Database Source
                            </Text>
                        </Group>
                        <Badge color={overview.databaseConfigured ? "green" : "red"} variant="light">
                            {overview.databaseConfigured ? "Connected" : "Not Set"}
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                        Target DB: <Code>{overview.databaseName || "PostgreSQL"}</Code>
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Format: PostgreSQL custom dump (<Code>.dump</Code>) with schema and data.
                    </Text>
                </Card>

                <Card withBorder padding="md" radius="md">
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconBrandTelegram size={20} color="var(--mantine-color-blue-5)" />
                            <Text fw={600} size="sm">
                                Telegram Destination
                            </Text>
                        </Group>
                        <Badge color={isTelegramReady ? "green" : "orange"} variant="light">
                            {isTelegramReady ? "Configured" : "Missing Config"}
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                        Group Chat ID:{" "}
                        <Code>{overview.telegramGroupChatId || "Not configured in .env"}</Code>
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Active Topic (Thread ID):{" "}
                        {overview.telegramTopicId ? (
                            <Code>{overview.telegramTopicId}</Code>
                        ) : (
                            <Badge size="xs" variant="outline" color="gray">
                                General / Main Chat
                            </Badge>
                        )}
                        {overview.savedBackupTopicId !== undefined && overview.savedBackupTopicId !== null ? (
                            <Badge ml={6} size="xs" variant="light" color="teal">
                                Saved in DB
                            </Badge>
                        ) : null}
                    </Text>
                </Card>
            </SimpleGrid>

            {/* Warning if Telegram is not configured */}
            {!isTelegramReady && (
                <Alert
                    icon={<IconAlertCircle size={18} />}
                    title="Telegram Configuration Notice"
                    color="yellow"
                    radius="md"
                >
                    To send database backups to Telegram, please make sure{" "}
                    <Code>TELEGRAM_BOT_TOKEN</Code> and <Code>TELEGRAM_GROUP_CHAT_ID</Code> are set
                    in your <Code>.env</Code> file. You can still create and download local backups
                    below.
                </Alert>
            )}

            {/* Topic / Thread ID Setting Card */}
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                    <div style={{ maxWidth: 460 }}>
                        <Group gap="xs" mb={4}>
                            <IconHash size={18} color="var(--mantine-color-blue-filled)" />
                            <Text fw={600} size="sm">
                                Telegram Backup Topic (Thread ID)
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                            If your Telegram group has forum topics enabled, you can send database
                            backups to a specific topic. Enter the thread ID (e.g. <Code>42</Code>)
                            or leave it empty for the General topic.
                        </Text>
                    </div>

                    <Group align="flex-end" gap="xs">
                        <TextInput
                            placeholder="e.g. 42 (empty = General)"
                            size="sm"
                            style={{ width: 220 }}
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.currentTarget.value)}
                            disabled={pending}
                        />
                        <Button
                            size="sm"
                            leftSection={<IconDeviceFloppy size={16} />}
                            loading={activeAction === "save_topic"}
                            disabled={pending}
                            onClick={handleSaveTopicId}
                        >
                            Save Topic ID
                        </Button>
                    </Group>
                </Group>
            </Paper>

            {/* Main Action Buttons */}
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <div>
                        <Text fw={600} size="md">
                            Run Database Backup
                        </Text>
                        <Text size="xs" c="dimmed">
                            Export current database tables and send the file directly to your
                            Telegram group or download it.
                        </Text>
                    </div>

                    <Group gap="sm">
                        <Button
                            variant="default"
                            size="sm"
                            leftSection={<IconRefresh size={16} />}
                            loading={activeAction === "refresh"}
                            disabled={pending}
                            onClick={refreshData}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="light"
                            size="sm"
                            leftSection={<IconDownload size={16} />}
                            loading={activeAction === "backup_only"}
                            disabled={pending}
                            onClick={handleCreateOnly}
                        >
                            Create Local Backup
                        </Button>

                        <Button
                            color="blue"
                            size="sm"
                            leftSection={<IconCloudUpload size={16} />}
                            loading={activeAction === "backup_send"}
                            disabled={pending}
                            onClick={handleCreateAndSend}
                        >
                            Backup &amp; Send to Telegram
                        </Button>
                    </Group>
                </Group>

                {/* Advanced Telegram Target Toggle */}
                <Box mt="sm">
                    <Button
                        variant="subtle"
                        size="xs"
                        color="gray"
                        leftSection={<IconSettings size={14} />}
                        onClick={() => setShowAdvanced((v) => !v)}
                    >
                        {showAdvanced ? "Hide Single-Run Overrides" : "Single-Run Destination Overrides (Optional)"}
                    </Button>

                    {showAdvanced && (
                        <Paper withBorder p="sm" mt="xs" radius="sm" bg="var(--mantine-color-gray-0)">
                            <Text size="xs" fw={500} mb="xs">
                                Override Telegram destination for the next backup only:
                            </Text>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <TextInput
                                    label="Custom Chat ID"
                                    placeholder="e.g. -1001234567890"
                                    size="xs"
                                    value={customChatId}
                                    onChange={(e) => setCustomChatId(e.currentTarget.value)}
                                    description="Leave empty to use TELEGRAM_GROUP_CHAT_ID from .env"
                                />
                                <TextInput
                                    label="Custom Topic ID"
                                    placeholder="e.g. 42"
                                    size="xs"
                                    value={customTopicId}
                                    onChange={(e) => setCustomTopicId(e.currentTarget.value)}
                                    description="Leave empty to use the saved Topic ID above"
                                />
                            </SimpleGrid>
                        </Paper>
                    )}
                </Box>
            </Paper>

            {/* Backups List Table */}
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <div>
                        <Text fw={600} size="md">
                            Backup History ({overview.backups?.length || 0})
                        </Text>
                        <Text size="xs" c="dimmed">
                            Saved database backup files on the server (<Code>backups/</Code> folder).
                        </Text>
                    </div>
                </Group>

                {backupRows ? (
                    <Table verticalSpacing="sm" highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>File Name</Table.Th>
                                <Table.Th>Size</Table.Th>
                                <Table.Th>Created Date</Table.Th>
                                <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{backupRows}</Table.Tbody>
                    </Table>
                ) : (
                    <Paper p="xl" withBorder radius="md" style={{ textAlign: "center" }}>
                        <IconDatabase
                            size={40}
                            color="var(--mantine-color-gray-5)"
                            style={{ margin: "0 auto", display: "block" }}
                        />
                        <Text fw={500} size="sm" mt="sm">
                            No backup files found
                        </Text>
                        <Text size="xs" c="dimmed" mt={4} mb="md">
                            Click &quot;Backup &amp; Send to Telegram&quot; above to create your first backup.
                        </Text>
                        <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconCloudUpload size={14} />}
                            loading={activeAction === "backup_send"}
                            disabled={pending}
                            onClick={handleCreateAndSend}
                        >
                            Create Backup Now
                        </Button>
                    </Paper>
                )}
            </Paper>

            {/* Instructions: Restore & Automated Cron */}
            <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="xs">
                    <IconTerminal2 size={16} style={{ display: "inline", verticalAlign: "middle" }} />
                    &nbsp;Database Restore &amp; Automated Scheduling Guide
                </Text>

                <Stack gap="xs">
                    <Text size="xs" c="dimmed">
                        <strong>1. How to restore a backup on your server or local machine:</strong>
                    </Text>
                    <Code block style={{ fontSize: rem(12) }}>
                        {`pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" financial_backup_YYYYMMDD_HHMMSS.dump`}
                    </Code>

                    <Divider my="xs" />

                    <Text size="xs" c="dimmed">
                        <strong>2. How to schedule automated daily backups (e.g. in Coolify Scheduled Tasks or Cron):</strong>
                    </Text>
                    <Text size="xs" c="dimmed">
                        Send a POST request to <Code>/api/cron/backup</Code> with your <Code>CRON_SECRET</Code>:
                    </Text>
                    <Code block style={{ fontSize: rem(12) }}>
                        {`curl -sS -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/backup`}
                    </Code>
                    <Text size="xs" c="dimmed">
                        This endpoint creates a database dump and automatically delivers it to your configured Telegram topic.
                    </Text>
                </Stack>
            </Paper>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm File Deletion"
                centered
            >
                <Text size="sm">
                    Are you sure you want to delete the backup file:
                </Text>
                <Code block my="sm">
                    {fileToDelete}
                </Code>
                <Text size="xs" c="red" mb="lg">
                    This action will permanently remove the file from the server.
                </Text>
                <Group justify="flex-end" gap="sm">
                    <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={executeDelete}>
                        Delete File
                    </Button>
                </Group>
            </Modal>
        </Stack>
    );
}
