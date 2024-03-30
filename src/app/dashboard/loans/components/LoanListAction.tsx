import DeleteItemActionIcon from "@dashboard/components/custom-action/DeleteItemActionIcon";
import { deleteLoan } from "@database/loan/actions";
import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Loan } from "@prisma/client";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { errorNotification, successNotification } from "utils/Notification/notification";

import { DASHBOARD_URL } from "utils/configs";

const LoanListAction = (row: Loan) => {

    const handleDelete = async (id: number) => {
        const result = await deleteLoan(id);
        if (result.status === 'ERROR') {
            errorNotification({
                title: 'Error',
                message: result.message,
            });
        }
        else if (result.status === 'SUCCESS') {
            successNotification({
                title: 'Success',
                message: result.message,
            });
        }
    }

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
        <DeleteItemActionIcon
            id={row.id}
            itemName={(row as any).account.code}
            tooltipLabel="Delete This Loan"
            handleDelete={handleDelete}
        />
    </>
}

export default LoanListAction