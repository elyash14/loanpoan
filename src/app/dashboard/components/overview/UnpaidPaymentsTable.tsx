'use client';

import PayAPaymentAction from "@dashboard/payments/components/PayAPaymentAction";
import type { DashboardUnpaidPayment } from "@database/dashboard/data";
import {
    Badge,
    Button,
    Group,
    NumberFormatter,
    Paper,
    Table,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { IconAlertTriangle, IconArrowRight, IconCash, IconCheck } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    unpaidPayments: DashboardUnpaidPayment[];
};

const UnpaidPaymentsTable = ({ unpaidPayments }: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    const overdueCount = unpaidPayments.filter((p) => p.isOverdue).length;

    return (
        <Paper withBorder p="md" mt="xl">
            <Group justify="space-between" align="center" mb="md" wrap="wrap">
                <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                        <IconCash size={20} />
                    </ThemeIcon>
                    <div>
                        <Group gap="xs" align="center">
                            <Title order={4}>Unpaid Loan Payments</Title>
                            <Badge variant="light" color="blue">
                                {unpaidPayments.length} Total
                            </Badge>
                            {overdueCount > 0 && (
                                <Badge
                                    variant="filled"
                                    color="red"
                                    leftSection={<IconAlertTriangle size={12} />}
                                >
                                    {overdueCount} Overdue
                                </Badge>
                            )}
                        </Group>
                        <Text size="xs" c="dimmed">
                            Active loan payments awaiting collection
                        </Text>
                    </div>
                </Group>

                <Button
                    component={Link}
                    href={`/${DASHBOARD_URL}/payments?status=Not+Paid`}
                    variant="subtle"
                    size="xs"
                    rightSection={<IconArrowRight size={14} />}
                >
                    View in Payments List
                </Button>
            </Group>

            {unpaidPayments.length > 0 ? (
                <Table.ScrollContainer minWidth={650}>
                    <Table striped highlightOnHover verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: 60 }}>#</Table.Th>
                                <Table.Th>Loan / Account</Table.Th>
                                <Table.Th>Payable Amount</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th style={{ width: 100, textAlign: "center" }}>
                                    Action
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {unpaidPayments.map((payment) => (
                                <Table.Tr key={payment.id}>
                                    <Table.Td fw={600} style={{ fontSize: "13px" }}>
                                        {payment.id}
                                    </Table.Td>
                                    <Table.Td>
                                        {payment.loan ? (
                                            <Link
                                                href={`/${DASHBOARD_URL}/loans/${payment.loan.id}/view`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--mantine-primary-color-filled)",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {payment.loan.account.code} - ({payment.loan.account.user.fullName})
                                            </Link>
                                        ) : (
                                            <Text size="sm" c="dimmed">
                                                ---
                                            </Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={700}>
                                        <NumberFormatter
                                            value={Number(payment.amount)}
                                            thousandSeparator
                                            prefix={`${currency?.symbol ?? ""} `}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {formatDate(new Date(payment.dueDate), dateType)}
                                    </Table.Td>
                                    <Table.Td>
                                        {payment.isOverdue ? (
                                            <Badge color="red" variant="light" size="sm">
                                                Overdue
                                            </Badge>
                                        ) : (
                                            <Badge color="yellow" variant="light" size="sm">
                                                Pending
                                            </Badge>
                                        )}
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: "center" }}>
                                        <PayAPaymentAction
                                            payment={{
                                                id: payment.id,
                                                amount: payment.amount as any,
                                                dueDate: new Date(payment.dueDate),
                                                paidAt: null,
                                                loanId: payment.loanId,
                                                loan: payment.loan as any,
                                            } as any}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            ) : (
                <Group justify="center" py="xl">
                    <ThemeIcon color="teal" variant="light" size="xl" radius="xl">
                        <IconCheck size={24} />
                    </ThemeIcon>
                    <div>
                        <Text fw={600} size="sm">
                            No unpaid payments
                        </Text>
                        <Text size="xs" c="dimmed">
                            All loan payments are currently settled!
                        </Text>
                    </div>
                </Group>
            )}
        </Paper>
    );
};

export default UnpaidPaymentsTable;
