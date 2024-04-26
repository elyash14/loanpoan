
'use client';

import { ActionIcon, Box, Container, Group, Text, useComputedColorScheme, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import cx from 'clsx';
import { useAtomValue } from 'jotai';
import { userAtom } from 'utils/stores/user';
import Logout from './Logout';
import classes from './Navbar.module.css';

const Navbar = () => {
    const { setColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const user = useAtomValue(userAtom);

    return (
        <Box className={classes.wrapper}>
            <Container size="sm">
                <Group>
                    <Group className={classes.userMenu}>
                        <Logout />
                        <Text c={theme.primaryColor}>{user!.email}</Text>
                    </Group>
                    <Group>
                        <ActionIcon
                            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                            variant="transparent"
                            size="xl"
                            aria-label="Toggle color scheme"
                        >
                            <IconSun className={cx(classes.icon, classes.light)} />
                            <IconMoon className={cx(classes.icon, classes.dark)} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}

export default Navbar;