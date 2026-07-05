'use client';

import type { DashboardStats } from "@database/dashboard/data";
import { Group, NumberFormatter, Paper, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
    IconAlertTriangle,
    IconCash,
    IconMoneybag,
    IconReceipt,
} from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    stats: DashboardStats;
};

type StatCardProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
    variant?: "default" | "overdue";
    href?: string;
};

const StatCard = ({ label, value, icon, variant = "default", href }: StatCardProps) => {
    const { currency } = useAtomValue(globalConfigAtom);
    const isOverdue = variant === "overdue";

    const content = (
        <>
            <Group justify="space-between" align="flex-start" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                    {label}
                </Text>
                <ThemeIcon
                    variant="light"
                    color={isOverdue ? "red" : "blue"}
                    size="md"
                >
                    {icon}
                </ThemeIcon>
            </Group>
            <Text fz="xl" fw={700}>
                <NumberFormatter
                    value={value}
                    thousandSeparator
                    prefix={`${currency?.symbol ?? ""} `}
                />
            </Text>
            {href && (
                <Text size="xs" c="dimmed" mt="xs">
                    View list →
                </Text>
            )}
        </>
    );

    return (
        <Paper
            withBorder
            p="md"
            style={{
                borderLeft: isOverdue
                    ? "4px solid var(--mantine-color-red-6)"
                    : undefined,
                transition: "box-shadow 150ms ease",
            }}
        >
            {href ? (
                <Link
                    href={href}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                    {content}
                </Link>
            ) : (
                content
            )}
        </Paper>
    );
};

const DashboardStatCards = ({ stats }: Props) => {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="xl">
            <StatCard
                label="Total Loans"
                value={stats.totals.loans}
                icon={<IconMoneybag size={18} />}
            />
            <StatCard
                label="Total Payments"
                value={stats.totals.payments}
                icon={<IconCash size={18} />}
            />
            <StatCard
                label="Total Installments"
                value={stats.totals.installments}
                icon={<IconReceipt size={18} />}
            />
            <StatCard
                label="Overdue Loans"
                value={stats.overdue.loans}
                icon={<IconAlertTriangle size={18} />}
                variant="overdue"
                href={`/${DASHBOARD_URL}/loans?status=Overdue`}
            />
            <StatCard
                label="Overdue Payments"
                value={stats.overdue.payments}
                icon={<IconAlertTriangle size={18} />}
                variant="overdue"
                href={`/${DASHBOARD_URL}/payments?status=Overdue`}
            />
            <StatCard
                label="Overdue Installments"
                value={stats.overdue.installments}
                icon={<IconAlertTriangle size={18} />}
                variant="overdue"
                href={`/${DASHBOARD_URL}/installments?status=Overdue`}
            />
        </SimpleGrid>
    );
};

export default DashboardStatCards;
