'use client'

import InfoList, { ListInfoType } from "@dashboard/components/list/InfoList";
import PayAPaymentAction from "@dashboard/payments/components/PayAPaymentAction";
import { Box, Button, Grid, NumberFormatter, RingProgress, Text } from "@mantine/core";
import { Account, Loan, Payment, User } from "@prisma/client";
import Decimal from "decimal.js";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    data: string,
    current: string,
}

const LoanInfo = ({ data, current }: Props) => {
    const { currency, dateType } = useAtomValue(globalConfigAtom);

    const loan: Loan = JSON.parse(data);
    const account: Account = (loan as any).account;
    const user: User = (loan as any).account.user;
    const paidPayments = (loan as any)._count.payments;

    const currentPayment: Payment = JSON.parse(current);

    const infoList: ListInfoType[] = [
        {
            title: 'User Info',
            value: <Link href={`/${DASHBOARD_URL}/users/${user.id}`}>{(user as any).fullName}</Link>
        },
        {
            title: 'Account Info',
            value: <Link href={`/${DASHBOARD_URL}/accounts/${account.id}`}>{account.code}</Link>
        },
        {
            title: 'Loan Amount',
            value: <NumberFormatter value={String(loan.amount)} thousandSeparator prefix={`${currency?.symbol} `} />
        },
        {
            title: 'Loan Create Date',
            value: formatDate(loan.createdAt, dateType)
        },
        {
            title: 'Start Date',
            value: formatDate(loan.startedAt!, dateType)
        },
        {
            title: 'Finish Date',
            value: formatDate(loan.finishedAt!, dateType)
        },
    ];

    return <Grid>
        <Grid.Col span={6} pl="xl">
            <InfoList listData={infoList} />
        </Grid.Col>
        <Grid.Col span={6}>
            <Box display="flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <RingProgress
                    size={140}
                    label={<>
                        <Text size="xs" c="green" ta="center">{paidPayments}</Text>
                        <Text size="lg" ta="center">{loan.paymentCount}</Text>
                    </>}
                    sections={[
                        { value: Decimal.mul(Decimal.div(paidPayments, loan.paymentCount), 100).toNumber(), color: 'green' },
                    ]}
                />
                <Text size="xs" ta="center">Payments Status</Text>
                <Box display="flex" mt="md">
                    <Button component={Link}
                        size="xs"
                        variant="default"
                        href={`/${DASHBOARD_URL}/payments?loanId=${loan.id}`}>
                        Show All
                    </Button>
                    {currentPayment && <PayAPaymentAction inList={false} payment={currentPayment} />}
                </Box>
            </Box>
        </Grid.Col>
    </Grid>
}
export default LoanInfo;