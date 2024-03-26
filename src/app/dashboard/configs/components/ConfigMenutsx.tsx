'use client'

import { NavLink, Paper, Title, rem } from "@mantine/core";
import { IconChevronRight, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import classes from "./page.module.css";

const URL_PREFIX = `/${DASHBOARD_URL}/configs`

const ConfigMenu = () => {
    const pathname = usePathname();

    return <Paper
        shadow="sm"
        p={rem(5)}
        className={classes.menuWrapper}
    >
        <Title className={classes.navbarHeader} order={3}>
            <IconSettings />
            &nbsp;Configs
        </Title>
        <NavLink
            component={Link}
            href={`${URL_PREFIX}/general`}
            label="General"
            active={pathname === `${URL_PREFIX}/general`}
            rightSection={
                <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
            }
        />
        <NavLink
            component={Link}
            href={`${URL_PREFIX}/installment`}
            label="Installment"
            active={pathname === `${URL_PREFIX}/installment`}
            rightSection={
                <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
            }
        />
    </Paper>
}

export default ConfigMenu;