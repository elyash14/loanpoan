"use client";

import { Table, Button, ActionIcon, Badge, Tooltip, Modal, NumberInput, TextInput, Group, Stack, Text, Card } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconPlus, IconRefresh, IconAdjustments, IconBrandTelegram } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { useAtomValue } from "jotai";
import { globalConfigAtom } from "utils/stores/configs";
import { reorderQueueAction, resetQueueAction, sendQueueToTelegramAction } from "@database/loan/queueActions";
import { successNotification, errorNotification } from "utils/Notification/notification";
import type { LoanPriorityEntry } from "@database/loan/queue";

interface Props {
    queueJson: string;
}

export default function LoanPriorityList({ queueJson }: Props) {
    const queue: LoanPriorityEntry[] = JSON.parse(queueJson);
    const { dateType, currency } = useAtomValue(globalConfigAtom);
    const [isPending, startTransition] = useTransition();

    // Reorder modal state
    const [selectedEntry, setSelectedEntry] = useState<LoanPriorityEntry | null>(null);
    const [newPosition, setNewPosition] = useState<number | "">(1);
    const [note, setNote] = useState("");

    const handleMoveUp = (entry: LoanPriorityEntry) => {
        if (entry.position <= 1) return;
        startTransition(async () => {
            const res = await reorderQueueAction(entry.accountId, entry.position - 1, "Moved up by admin");
            if (res.status === "SUCCESS") {
                successNotification({ title: "Success", message: `Moved ${entry.userFullName} up.` });
            } else {
                errorNotification({ title: "Error", message: res.message });
            }
        });
    };

    const handleMoveDown = (entry: LoanPriorityEntry) => {
        if (entry.position >= queue.length) return;
        startTransition(async () => {
            const res = await reorderQueueAction(entry.accountId, entry.position + 1, "Moved down by admin");
            if (res.status === "SUCCESS") {
                successNotification({ title: "Success", message: `Moved ${entry.userFullName} down.` });
            } else {
                errorNotification({ title: "Error", message: res.message });
            }
        });
    };

    const handleCustomReorderSubmit = () => {
        if (!selectedEntry || typeof newPosition !== "number") return;
        startTransition(async () => {
            const res = await reorderQueueAction(selectedEntry.accountId, newPosition, note);
            if (res.status === "SUCCESS") {
                successNotification({ title: "Success", message: `Reordered ${selectedEntry.userFullName} to position ${newPosition}.` });
                setSelectedEntry(null);
                setNote("");
            } else {
                errorNotification({ title: "Error", message: res.message });
            }
        });
    };

    const handleReset = () => {
        if (!confirm("Are you sure you want to reset the priority queue to automatic sorting? This will clear all manual position adjustments.")) return;
        startTransition(async () => {
            const res = await resetQueueAction();
            if (res.status === "SUCCESS") {
                successNotification({ title: "Success", message: "Queue reset to automatic order." });
            } else {
                errorNotification({ title: "Error", message: res.message });
            }
        });
    };

    const handleSendToTelegram = () => {
        startTransition(async () => {
            const res = await sendQueueToTelegramAction();
            if (res.status === "SUCCESS") {
                successNotification({ title: "Success", message: res.message });
            } else {
                errorNotification({ title: "Error", message: res.message });
            }
        });
    };

    return (
        <Card withBorder radius="md" p="md" bg="var(--mantine-color-body)">
            <Group justify="space-between" mb="md">
                <div>
                    <Text size="lg" fw={700}>Waiting Priority Queue</Text>
                    <Text size="xs" c="muted">Ordered by completed loan count tiers, FIFO of joining time, then manual overrides.</Text>
                </div>
                <Group gap="xs">
                    <Button 
                        size="xs" 
                        variant="light" 
                        color="blue" 
                        leftSection={<IconBrandTelegram size={14} />}
                        onClick={handleSendToTelegram}
                        loading={isPending}
                    >
                        Send to Telegram
                    </Button>
                    <Button 
                        size="xs" 
                        variant="light" 
                        color="red" 
                        leftSection={<IconRefresh size={14} />}
                        onClick={handleReset}
                        loading={isPending}
                    >
                        Reset to Automatic
                    </Button>
                </Group>
            </Group>

            <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ width: 60 }}>#</Table.Th>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Account</Table.Th>
                            <Table.Th>Past Loans</Table.Th>
                            <Table.Th>Joined Queue</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Account Balance</Table.Th>
                            <Table.Th style={{ width: 180 }}><Text ta="center">Actions</Text></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {queue.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" py="xl" c="dimmed">No accounts in queue.</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            queue.map((entry) => {
                                const isFirst = entry.position === 1;
                                const isLast = entry.position === queue.length;
                                return (
                                    <Table.Tr key={entry.id}>
                                        <Table.Td fw={700} style={{ fontSize: "15px" }}>{entry.position}</Table.Td>
                                        <Table.Td>
                                            <Tooltip label="View profile">
                                                <Link 
                                                    href={`/${DASHBOARD_URL}/users/${entry.userId}/view`}
                                                    style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)", fontWeight: 600 }}
                                                >
                                                    {entry.userFullName}
                                                </Link>
                                            </Tooltip>
                                        </Table.Td>
                                        <Table.Td>
                                            <Tooltip label="View account">
                                                <Link 
                                                    href={`/${DASHBOARD_URL}/accounts/${entry.accountId}/view`}
                                                    style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)" }}
                                                >
                                                    {entry.accountCode}
                                                </Link>
                                            </Tooltip>
                                        </Table.Td>
                                        <Table.Td>{entry.completedLoanCount}</Table.Td>
                                        <Table.Td>{formatDate(entry.joinedAt, dateType)}</Table.Td>
                                        <Table.Td>
                                            {entry.isManualPosition ? (
                                                <Tooltip label={entry.manualNote || "Manually repositioned by Admin"}>
                                                    <Badge color="orange" leftSection={<IconAdjustments size={12} />} style={{ cursor: "pointer" }}>
                                                        Adjusted
                                                    </Badge>
                                                </Tooltip>
                                            ) : (
                                                <Badge color="gray">Auto</Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td fw={600} style={{ fontFamily: "monospace" }}>
                                            {currency?.symbol} {Number(entry.balance).toLocaleString()}
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" justify="center">
                                                <Tooltip label="Move up">
                                                    <ActionIcon 
                                                        variant="subtle" 
                                                        color="blue" 
                                                        disabled={isFirst || isPending}
                                                        onClick={() => handleMoveUp(entry)}
                                                    >
                                                        <IconChevronUp size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Move down">
                                                    <ActionIcon 
                                                        variant="subtle" 
                                                        color="blue" 
                                                        disabled={isLast || isPending}
                                                        onClick={() => handleMoveDown(entry)}
                                                    >
                                                        <IconChevronDown size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Custom position & note">
                                                    <ActionIcon 
                                                        variant="subtle" 
                                                        color="orange" 
                                                        disabled={isPending}
                                                        onClick={() => {
                                                            setSelectedEntry(entry);
                                                            setNewPosition(entry.position);
                                                            setNote(entry.manualNote || "");
                                                        }}
                                                    >
                                                        <IconAdjustments size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Pay / Add Loan">
                                                    <ActionIcon 
                                                        component={Link}
                                                        href={`/${DASHBOARD_URL}/loans/add/${entry.accountId}`}
                                                        variant="filled" 
                                                        color="green" 
                                                    >
                                                        <IconPlus size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            <Modal 
                opened={selectedEntry !== null} 
                onClose={() => setSelectedEntry(null)} 
                title="Adjust Priority Position"
                centered
            >
                {selectedEntry && (
                    <Stack gap="md">
                        <Text size="sm">Adjusting priority position for <b>{selectedEntry.userFullName}</b> (Account: {selectedEntry.accountCode}).</Text>
                        
                        <NumberInput
                            label="Target Position"
                            description={`Enter a position between 1 and ${queue.length}`}
                            min={1}
                            max={queue.length}
                            value={newPosition}
                            onChange={(val) => setNewPosition(val as number)}
                            required
                        />

                        <TextInput
                            label="Adjustment Note"
                            placeholder="e.g. Negotiated with member to delay for Ali"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" onClick={() => setSelectedEntry(null)}>Cancel</Button>
                            <Button color="orange" onClick={handleCustomReorderSubmit} loading={isPending}>Save Position</Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Card>
    );
}
