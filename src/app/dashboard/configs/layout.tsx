import PagePaper from '@dashboard/components/paper/PagePaper';
import { Box, rem } from '@mantine/core';
import ConfigMenu from './components/ConfigMenu';

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
