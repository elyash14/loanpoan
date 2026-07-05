'use client';

import PayAnInstallmentAction from "@dashboard/installments/components/PayAnInstallmentAction";
import { Box, NumberFormatter, Table, Text } from "@mantine/core";
import { Installment } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import classes from "./UserInfo.module.css";

type Props = {
    userId: number;
    installmentsPaidCount: number;
    latestInstallments: Installment[];
};

const UserInstallments = ({
    userId,
    installmentsPaidCount,
    latestInstallments,
}: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    return (
        <Box className={classes.installmentsWrapper} ml="xs">
            <Box className={classes.installmentsCount}>
                <Text fw={700} span>
                    Installments Paid So Far:{" "}
                </Text>
                <Text fz={30} fw={900} span>
                    {installmentsPaidCount}
                </Text>
            </Box>

            {latestInstallments.length > 0 ? (
                <Box mt="md" w="100%">
                    <Text fw={600} mb="xs">
                        Latest Installments:
                    </Text>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {latestInstallments.map((installment) => (
                                <Table.Tr key={installment.id}>
                                    <Table.Td>
                                        <NumberFormatter
                                            value={Number(installment.amount)}
                                            thousandSeparator
                                            prefix={`${currency?.symbol} `}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {formatDate(installment.dueDate, dateType!)}
                                    </Table.Td>
                                    <Table.Td>
                                        {installment.paidAt ? (
                                            "Paid"
                                        ) : (
                                            <PayAnInstallmentAction
                                                installment={installment}
                                            />
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Box>
            ) : (
                <Box ta="center" mt="md">
                    <Text fw={600}>No installments yet</Text>
                </Box>
            )}

            <Box mt="md" ta="end" w="100%">
                <Link href={`/${DASHBOARD_URL}/installments?user=${userId}`}>
                    View all installments
                </Link>
            </Box>
        </Box>
    );
};

export default UserInstallments;
