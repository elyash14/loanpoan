'use client';
import { Center, Tabs, rem } from "@mantine/core";
import { IconBrandTelegram, IconCash, IconDashboard, IconIdBadge2, IconMoneybag, IconSettings, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";

const MainMenu = () => {
    const iconStyle = { width: rem(12), height: rem(12) };
    const router = useRouter();
    const pathname = usePathname() || "";

    const activeTab = (() => {
        if (pathname.startsWith(`/${DASHBOARD_URL}/configs`)) return `/${DASHBOARD_URL}/configs/general`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/users`)) return `/${DASHBOARD_URL}/users`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/accounts`)) return `/${DASHBOARD_URL}/accounts`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/installments`)) return `/${DASHBOARD_URL}/installments`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/loans`)) return `/${DASHBOARD_URL}/loans`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/payments`)) return `/${DASHBOARD_URL}/payments`;
        if (pathname.startsWith(`/${DASHBOARD_URL}/payment-requests`)) return `/${DASHBOARD_URL}/payment-requests`;
        return `/${DASHBOARD_URL}`;
    })();

    return (
        <Center mb={rem(20)}>
            <Tabs variant="pills" radius="md" value={activeTab}
                onChange={(value) => router.push(value as string)}>
                <Tabs.List>
                    <Tabs.Tab value={`/${DASHBOARD_URL}`} leftSection={<IconDashboard style={iconStyle} />}>
                        Dashboard
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/users`} leftSection={<IconUsers style={iconStyle} />}>
                        Users
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/accounts`} leftSection={<IconIdBadge2 style={iconStyle} />}>
                        Accounts
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/installments`} leftSection={<IconIdBadge2 style={iconStyle} />}>
                        Installments
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/loans`} leftSection={<IconMoneybag style={iconStyle} />}>
                        Loans
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/payments`} leftSection={<IconCash style={iconStyle} />}>
                        Payments
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/payment-requests`} leftSection={<IconCash style={iconStyle} />}>
                        Payment Requests
                    </Tabs.Tab>
                    <Tabs.Tab value={`/${DASHBOARD_URL}/configs/general`} leftSection={<IconSettings style={iconStyle} />}>
                        Configs
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
        </Center>
    );
}

export default MainMenu;