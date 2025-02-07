'use client'

import InfoList, { ListInfoType } from "@dashboard/components/list/InfoList";
import { Box, Grid, NumberFormatter, Text } from "@mantine/core";
import { Account, Loan, User } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import classes from './AccountInfo.module.css';

type Props = {
    data: string,
    currentLoanData: string,
}

const AccountInfo = ({ data, currentLoanData }: Props) => {
    const { currency, dateType } = useAtomValue(globalConfigAtom);

    const account: Account = JSON.parse(data);
    const user: User = (account as any).user;
    const loanCount = (account as any)._count.loans;

    const currentLoan: Loan = JSON.parse(currentLoanData);


    const infoList: ListInfoType[] = [
        {
            title: 'User Info',
            value: <Link href={`/${DASHBOARD_URL}/users/${user.id}`}>{(user as any).fullName}</Link>
        },
        {
            title: 'Account Code',
            value: account.code
        },
        {
            title: 'Account Name',
            value: account.name ?? '---'
        },
        {
            title: 'Account Create Date',
            value: formatDate(account.createdAt, dateType)
        },
        {
            title: 'Account Opened Date',
            value: formatDate(account.openedAt!, dateType)
        },
    ];
    if (account.deletedAt) {
        infoList.push({
            title: 'Deleted At',
            value: formatDate(account.deletedAt!, dateType)
        })
    }

    return <Grid>
        <Grid.Col span={6} pl="xl">
            <InfoList listData={infoList} />
        </Grid.Col>
        <Grid.Col span={6}>
            <Box className={classes.balanceAndFactor}>
                <Box className={classes.balance}>
                    <Text size="md" fw={900}>Balance</Text>
                    <Text className={classes.balanceAmount} fz={50} fw={900} lh="40px">
                        <NumberFormatter value={String(account.balance)} thousandSeparator />
                    </Text>
                    <Text fz={16} fw={300} ta="end" fs="italic">{currency?.symbol}&nbsp;</Text>
                </Box>
                <Text mt="lg" fw={800} span>Installment Factor: {account.installmentFactor}</Text>
            </Box>
        </Grid.Col>
    </Grid>
}
export default AccountInfo;