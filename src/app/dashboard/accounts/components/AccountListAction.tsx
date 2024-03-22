import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Account } from "@prisma/client";
import { IconEdit, IconEye } from "@tabler/icons-react";
import Link from "next/link";

import { DASHBOARD_URL } from "utils/configs";

const AccountListAction = (row: Account) => {
    return <>
        <Tooltip label="View Account">
            <ActionIcon
                href={`/${DASHBOARD_URL}/accounts/${row.id}/view`}
                component={Link}
                size="sm"
                variant="light"
                mr={rem(3)}>
                <IconEye />
            </ActionIcon>
        </Tooltip>
        <Tooltip label="Edit Account">
            <ActionIcon
                href={`/${DASHBOARD_URL}/accounts/${row.id}/edit`}
                component={Link}
                size="sm"
                variant="light"
                mr={rem(3)}>
                <IconEdit />
            </ActionIcon>
        </Tooltip>
    </>
}

export default AccountListAction