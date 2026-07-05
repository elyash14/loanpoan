'use client';

import { ActionIcon, Group, Tabs, Tooltip, rem } from "@mantine/core";
import { Account, Installment, Loan, User } from "@prisma/client";
import {
    IconBrandSamsungpass,
    IconEdit,
    IconIdBadge2,
    IconMoneybag,
    IconReceipt,
    IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import UserAccounts from "./UserAccounts";
import UserInfo from "./UserInfo";
import UserInstallments from "./UserInstallments";
import UserLoans from "./UserLoans";
import classes from "./UserInfo.module.css";

type UserForView = User & {
    fullName: string;
    _count: { accounts: number };
};

type Props = {
    userData: string;
    accountsData: string;
    accountsCount: number;
    loansCount: number;
    installmentsCount: number;
    currentLoanData: string;
    installmentsPaidCount: number;
    latestInstallmentsData: string;
};

const UserViewTabs = ({
    userData,
    accountsData,
    accountsCount,
    loansCount,
    installmentsCount,
    currentLoanData,
    installmentsPaidCount,
    latestInstallmentsData,
}: Props) => {
    const user: UserForView = JSON.parse(userData);
    const accounts: Account[] = JSON.parse(accountsData);
    const currentLoan: Loan | null = JSON.parse(currentLoanData);
    const latestInstallments: Installment[] = JSON.parse(latestInstallmentsData);

    return (
        <>
            <Group justify="flex-end" mb="md" className={classes.actions}>
                <Tooltip label="Edit User">
                    <ActionIcon
                        href={`/${DASHBOARD_URL}/users/${user.id}/edit`}
                        component={Link}
                        size="sm"
                        variant="light"
                    >
                        <IconEdit />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Change Password">
                    <ActionIcon
                        href={`/${DASHBOARD_URL}/users/${user.id}/change-password`}
                        component={Link}
                        size="sm"
                        variant="light"
                        mr={rem(3)}
                    >
                        <IconBrandSamsungpass />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <Tabs defaultValue="info" keepMounted={false}>
                <Tabs.List mb="md">
                    <Tabs.Tab
                        value="info"
                        leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />}
                    >
                        Info
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="accounts"
                        leftSection={
                            <IconIdBadge2 style={{ width: rem(16), height: rem(16) }} />
                        }
                    >
                        Accounts ({accountsCount})
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="installments"
                        leftSection={
                            <IconReceipt style={{ width: rem(16), height: rem(16) }} />
                        }
                    >
                        Installments ({installmentsCount})
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="loans"
                        leftSection={
                            <IconMoneybag style={{ width: rem(16), height: rem(16) }} />
                        }
                    >
                        Loans ({loansCount})
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="info">
                    <UserInfo data={userData} />
                </Tabs.Panel>

                <Tabs.Panel value="accounts">
                    <UserAccounts
                        userId={user.id}
                        accountsCount={accountsCount}
                        accounts={accounts}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="installments">
                    <UserInstallments
                        userId={user.id}
                        installmentsPaidCount={installmentsPaidCount}
                        latestInstallments={latestInstallments}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="loans">
                    <UserLoans
                        userId={user.id}
                        currentLoan={currentLoan}
                        loansCount={loansCount}
                    />
                </Tabs.Panel>
            </Tabs>
        </>
    );
};

export default UserViewTabs;
