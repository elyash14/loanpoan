import PagePaper from '@dashboard/components/paper/PagePaper';
import { Box, rem } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import ConfigMenu from './components/ConfigMenutsx';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box display='flex'>
      <Box miw={200}>
        <ConfigMenu />
      </Box>
      <Box flex={1} pl={rem(10)}>
        <PagePaper>
          {children}
        </PagePaper>
      </Box>
    </Box>
  );
}
