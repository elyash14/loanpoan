import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Loan } from "@prisma/client";
import { IconEdit, IconEye } from "@tabler/icons-react";
import Link from "next/link";

import { DASHBOARD_URL } from "utils/configs";

const LoanListAction = (row: Loan) => {
    return <>
        <Tooltip label="View Loan">
            <ActionIcon
                href={`/${DASHBOARD_URL}/loans/${row.id}/view`}
                component={Link}
                size="sm"
                variant="light"
                mr={rem(3)}>
                <IconEye />
            </ActionIcon>
        </Tooltip>
        <Tooltip label="Edit Loan">
            <ActionIcon
                href={`/${DASHBOARD_URL}/loans/${row.id}/edit`}
                component={Link}
                size="sm"
                variant="light"
                mr={rem(3)}>
                <IconEdit />
            </ActionIcon>
        </Tooltip>
        {/* <DeleteItemActionIcon
            id={row.id}
            itemName={row.code}
            tooltipLabel="Delete This Loan"
        /> */}
    </>
}

export default LoanListAction