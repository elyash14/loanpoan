'use client'
import { ActionIcon, Group } from "@mantine/core";
import { IconAdjustments, IconHome, IconIdBadge2, IconMoneybag, IconUserCog } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const BottomNavbar = () => {
    const pathname = usePathname();
    return <Group px="xl" py="md" justify="space-between">
        <ActionIcon
            component={Link}
            href="/profile"

            variant={pathname == '/profile' ? 'filled' : 'subtle'} size="lg" radius="lg" aria-label="Settings"
        >
            <IconUserCog size="1.3rem" stroke={1.5} />
        </ActionIcon>
        <ActionIcon variant={pathname == 'test' ? 'filled' : 'subtle'} size="lg" radius="lg" aria-label="Settings">
            <IconIdBadge2 size="1.3rem" stroke={1.5} />
        </ActionIcon>
        <ActionIcon
            component={Link}
            href="/home"
            variant={pathname == '/home' ? 'filled' : 'subtle'} size="xl" radius="xl" aria-label="Settings"
        >
            <IconHome size="1.8rem" stroke={1.5} />
        </ActionIcon>
        <ActionIcon variant={pathname == 'test' ? 'filled' : 'subtle'} size="lg" radius="lg" aria-label="Settings">
            <IconMoneybag size="1.3rem" stroke={1.5} />
        </ActionIcon>
        <ActionIcon variant={pathname == 'test' ? 'filled' : 'subtle'} size="lg" radius="lg" aria-label="Settings">
            <IconAdjustments size="1.3rem" stroke={1.5} />
        </ActionIcon>
    </Group>
}

export default BottomNavbar; 