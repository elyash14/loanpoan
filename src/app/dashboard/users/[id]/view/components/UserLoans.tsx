'use client';

import {
    Blockquote,
    Box,
    Button,
    List,
    NumberFormatter,
    Text,
    Title,
} from "@mantine/core";
import { Loan } from "@prisma/client";
import { IconMoneybag } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { globalConfigAtom } from "utils/stores/configs";
import classes from "./UserInfo.module.css";

type Props = {
    userId: number;
    currentLoan: Loan | null;
    loansCount: number;
};

const UserLoans = ({ userId, currentLoan, loansCount }: Props) => {
    const { currency } = useAtomValue(globalConfigAtom);

    return (
        <Box className={classes.loansWrapper} mx="xs">
            <Box className={classes.loansCount}>
                <Text fw={700} span>
                    Loans Taken So Far:{" "}
                </Text>
                <Text fz={30} fw={900} span>
                    {loansCount}
                </Text>
            </Box>

            {currentLoan ? (
                <Blockquote
                    w="100%"
                    color="teal"
                    icon={<IconMoneybag />}
                    mt="xl"
                >
                    <Title order={3} mb="md">
                        Current Loan
                    </Title>
                    <List mb="md">
                        <List.Item>
                            <b>Amount:</b>&nbsp;
                            <NumberFormatter
                                value={String(currentLoan.amount)}
                                thousandSeparator
                                prefix={`${currency?.symbol} `}
                            />
                        </List.Item>
                        <List.Item>
                            <b>Total Payments:</b>&nbsp;
                            {currentLoan.paymentCount}
                        </List.Item>
                        <List.Item>
                            <b>Paid Payments:</b>&nbsp;
                            {(currentLoan as Loan & { _count: { payments: number } })._count.payments}
                        </List.Item>
                    </List>
                    <Box ta="end">
                        <Button
                            size="xs"
                            component={Link}
                            href={`/${DASHBOARD_URL}/loans/${currentLoan.id}/view`}
                        >
                            More Info
                        </Button>
                    </Box>
                </Blockquote>
            ) : (
                <Box ta="center" mt="md">
                    <Title order={3}>No current loan</Title>
                </Box>
            )}

            {loansCount > 0 && (
                <Box mt="md" w="100%" ta="end">
                    <Link href={`/${DASHBOARD_URL}/loans?user=${userId}`}>
                        View all loans
                    </Link>
                </Box>
            )}
        </Box>
    );
};

export default UserLoans;
