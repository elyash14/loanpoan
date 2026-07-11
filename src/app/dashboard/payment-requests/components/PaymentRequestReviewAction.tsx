'use client';

import { reviewPaymentRequest } from "@database/payment/actions";
import { ActionIcon, Button, Group, Image, List, Modal, NumberFormatter, Text, ThemeIcon, Tooltip, rem, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertOctagonFilled, IconCheck, IconCircleDashed, IconEye, IconX } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    request: any;
};

export default function PaymentRequestReviewAction({ request }: Props) {
    const { dateType, currency } = useAtomValue(globalConfigAtom);
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);
    const [isPending, setIsPending] = useState(false);

    const handleAction = async (status: "APPROVED" | "REJECTED") => {
        setIsPending(true);
        try {
            const result = await reviewPaymentRequest(request.id, status);
            if (result.status === "ERROR") {
                errorNotification({
                    title: "Error",
                    message: result.message,
                });
            } else if (result.status === "SUCCESS") {
                successNotification({
                    title: "Success",
                    message: result.message,
                });
                close();
            }
        } catch (err) {
            console.error(err);
            errorNotification({
                title: "Error",
                message: "Something went wrong",
            });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <Tooltip label="Review Payment Request">
                <ActionIcon
                    size="sm"
                    variant="light"
                    mr={rem(3)}
                    onClick={open}
                >
                    <IconEye size={16} />
                </ActionIcon>
            </Tooltip>

            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Text fw="bold" display="flex" c="blue" style={{ alignItems: "center" }}>
                        Review Payment Request #{request.id} &nbsp;<IconAlertOctagonFilled />
                    </Text>
                }
                size="lg"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: rem(16) }}>
                    <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon size={20} radius="xl" variant="light">
                                <IconCircleDashed style={{ width: rem(12), height: rem(12) }} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>
                            <Text fw={700} span c={theme.primaryColor}>User:</Text> {request.user.firstName} {request.user.lastName} ({request.user.email})
                        </List.Item>
                        <List.Item>
                            <Text fw={700} span c={theme.primaryColor}>Submitted Amount:</Text>{" "}
                            <NumberFormatter value={String(request.amount)} thousandSeparator prefix={`${currency?.symbol} `} />
                        </List.Item>
                        <List.Item>
                            <Text fw={700} span c={theme.primaryColor}>Date:</Text> {formatDate(new Date(request.createdAt), dateType)}
                        </List.Item>
                        <List.Item>
                            <Text fw={700} span c={theme.primaryColor}>Status:</Text>{" "}
                            <Text span fw="bold" c={request.status === "APPROVED" ? "green" : request.status === "REJECTED" ? "red" : "blue"}>
                                {request.status}
                            </Text>
                        </List.Item>
                    </List>

                    {/* Linked Items */}
                    <div>
                        <Text fw="bold" size="sm" mb={4} c={theme.primaryColor}>Items Included in This Payment:</Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: rem(6), paddingLeft: rem(12) }}>
                            {request.installments.map((inst: any) => (
                                <Text key={inst.id} size="xs" c="dimmed">
                                    • Monthly Installment for Account <b>{inst.account?.code}</b>:{" "}
                                    <NumberFormatter value={String(inst.amount)} thousandSeparator prefix={`${currency?.symbol} `} /> (Due: {formatDate(new Date(inst.dueDate), dateType)})
                                </Text>
                            ))}
                            {request.payments.map((pay: any) => (
                                <Text key={pay.id} size="xs" c="dimmed">
                                    • Loan Payment for Loan #{pay.loanId} (Account: {pay.loan?.account?.code}):{" "}
                                    <NumberFormatter value={String(pay.amount)} thousandSeparator prefix={`${currency?.symbol} `} /> (Due: {formatDate(new Date(pay.dueDate), dateType)})
                                </Text>
                            ))}
                        </div>
                    </div>

                    {/* Receipt Image */}
                    <div>
                        <Text fw="bold" size="sm" mb={4} c={theme.primaryColor}>Uploaded Receipt Screenshot:</Text>
                        {request.receiptFileId ? (
                            <div style={{ border: "1px solid #e0e0e0", borderRadius: rem(8), overflow: "hidden", position: "relative" }}>
                                <a href={`/api/dashboard/receipt/${request.id}`} target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={`/api/dashboard/receipt/${request.id}`}
                                        alt="Payment Receipt"
                                        h={300}
                                        fit="contain"
                                        fallbackSrc="https://placehold.co/600x400?text=Receipt+Not+Found"
                                    />
                                </a>
                                <Text size="xs" c="dimmed" style={{ textAlign: "center", padding: rem(4) }}>
                                    Stored on Telegram · click to open full size
                                </Text>
                            </div>
                        ) : (
                            <Text size="sm" c="dimmed">Receipt not available (stored on Telegram group only).</Text>
                        )}
                    </div>

                    {request.status === "PENDING" ? (
                        <>
                            <Text size="sm">Are you sure you want to approve or reject this payment request?</Text>
                            <Group justify="flex-end" gap="xs">
                                <Button
                                    onClick={() => handleAction("REJECTED")}
                                    color="red"
                                    leftSection={<IconX size={16} />}
                                    loading={isPending}
                                >
                                    Reject Request
                                </Button>
                                <Button
                                    onClick={() => handleAction("APPROVED")}
                                    color="green"
                                    leftSection={<IconCheck size={16} />}
                                    loading={isPending}
                                >
                                    Approve and Pay Items
                                </Button>
                                <Button onClick={close} variant="default" disabled={isPending}>
                                    Cancel
                                </Button>
                            </Group>
                        </>
                    ) : (
                        <div>
                            <Text size="xs" c="dimmed">
                                Reviewed by Admin ID: {request.reviewedById}. No further action can be taken.
                            </Text>
                            <Group justify="flex-end" mt={rem(12)}>
                                <Button onClick={close} variant="default">Close</Button>
                            </Group>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
