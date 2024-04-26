'use client'

import { AppShell } from "@mantine/core";
import BottomNavbar from "./bottom-navbar/BottomNavbar";
import Header from "./header/Header";

type Props = {
    children: React.ReactNode
}
const MainLayout = ({ children }: Props) => {
    return <AppShell
        header={{ height: 60 }}
        navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: true },
        }}
        padding="md"
        withBorder={false}
    >
        <AppShell.Header>
            <Header />
        </AppShell.Header>
        <AppShell.Footer>
            <BottomNavbar />
        </AppShell.Footer>

        <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
}

export default MainLayout;
