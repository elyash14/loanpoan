'use client';
import { Center, Tabs, rem } from "@mantine/core";
import { IconDashboard, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from "next/navigation";

const MainMenu = () => {
    const iconStyle = { width: rem(12), height: rem(12) };
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Center>
            <Tabs variant="pills" radius="md" defaultValue="gallery" value={pathname}
                onChange={(value) => router.push(value as string)}>
                <Tabs.List>
                    <Tabs.Tab value="/dashboard" leftSection={<IconDashboard style={iconStyle} />}>
                        Dashboard
                    </Tabs.Tab>
                    <Tabs.Tab value="/dashboard/users" leftSection={<IconUsers style={iconStyle} />}>
                        Users
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
        </Center>
    );
}

export default MainMenu;