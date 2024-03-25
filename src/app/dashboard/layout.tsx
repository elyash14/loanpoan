import MainMenu from '@dashboard/components/main-menu/MainMenu';
import Navbar from '@dashboard/components/navbar/Navbar';
import { ColorSchemeScript, Container, MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
  components: {
    InputWrapper: {
      styles: {
        root: {
          marginBottom: '1rem',
        },
      },
    },
  },

});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Navbar />
          <MainMenu />
          <Container size="lg">
            {children}
          </Container>
          <Notifications />
        </MantineProvider>
      </body>
    </html>
  );
}
