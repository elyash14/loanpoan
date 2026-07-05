'use client';

import { Box, NumberFormatter, Table, Text } from "@mantine/core";
import { Account } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import classes from "./UserInfo.module.css";

type Props = {
    userId: number;
    accountsCount: number;
    accounts: Account[];
};

const UserAccounts = ({ userId, accountsCount, accounts }: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    return (
        <Box className={classes.accountsTable}>
            {accountsCount > 0 ? (
                <>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Code</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Balance</Table.Th>
                                <Table.Th>Opened At</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {accounts.map((account) => (
                                <Table.Tr key={account.id}>
                                    <Table.Td>
                                        <Link
                                            href={`/${DASHBOARD_URL}/accounts/${account.id}/view`}
                                        >
                                            {account.code}
                                        </Link>
                                    </Table.Td>
                                    <Table.Td>{account.name ?? "---"}</Table.Td>
                                    <Table.Td>
                                        <NumberFormatter
                                            value={String(account.balance)}
                                            thousandSeparator
                                            prefix={`${currency?.symbol} `}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {account.openedAt
                                            ? formatDate(account.openedAt, dateType!)
                                            : "---"}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Box mt="md" ta="end">
                        <Link href={`/${DASHBOARD_URL}/accounts?user=${userId}`}>
                            View all accounts
                        </Link>
                    </Box>
                </>
            ) : (
                <Box ta="center" mt="md">
                    <Text fw={600}>No accounts yet</Text>
                </Box>
            )}
        </Box>
    );
};

export default UserAccounts;
