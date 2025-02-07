import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Installment } from "@prisma/client";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";

import { DASHBOARD_URL } from "utils/configs";
import PayAnInstallmentAction from "./PayAnInstallmentAction";

const InstallmentListAction = (row: Installment) => {
    return <>
        <Tooltip label="View Installment">
            <ActionIcon
                href={`/${DASHBOARD_URL}/installments/${row.id}/view`}
                component={Link}
                size="sm"
                variant="light"
                mr={rem(3)}>
                <IconEye />
            </ActionIcon>
        </Tooltip>
        <PayAnInstallmentAction installment={row} />
    </>
}

export default InstallmentListAction