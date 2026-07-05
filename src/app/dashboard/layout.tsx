import MainMenu from '@dashboard/components/main-menu/MainMenu';
import Navbar from '@dashboard/components/navbar/Navbar';
import { getGlobalConfigs } from '@database/config/data';
import { Container } from '@mantine/core';
import type { Metadata } from "next";
import { getSession } from 'utils/auth/dataAccessLayer';
import { SessionUser } from 'utils/auth/session';
import { GlobalConfigType } from 'utils/types/configs';
import HydrateData from './components/store/HydrateData';

export const metadata: Metadata = {
    title: "Dashboard | Next Financial",
    description: "Admin dashboard for managing accounts, loans, and installments",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const config = (await getGlobalConfigs() as GlobalConfigType);
    const session = await getSession();

    return (
        <>
            <HydrateData globalConfig={config} user={session as SessionUser} />
            <InnerLayout>
                {children}
            </InnerLayout>
        </>
    );
}

const InnerLayout = ({ children }: { children: React.ReactNode }) => {
    return <>
        <Navbar />
        <MainMenu />
        <Container size="lg">
            {children}
        </Container>
    </>
}