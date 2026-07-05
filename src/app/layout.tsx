import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import type { Metadata } from "next";
import theme from 'utils/theme';


export const metadata: Metadata = {
    title: "Next Financial",
    description: "Financial management application for accounts, loans, and installments",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="dark" />
            </head>
            <body suppressHydrationWarning>
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    {children}
                    <Notifications />
                </MantineProvider>
            </body>
        </html>
    );
}
