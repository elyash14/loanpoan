import DeleteItemActionIcon from "@dashboard/components/custom-action/DeleteItemActionIcon";
import { deleteAccount } from "@database/account/actions";
import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Account } from "@prisma/client";
import { IconEdit, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import {
  errorNotification,
  successNotification,
} from "utils/Notification/notification";

import { DASHBOARD_URL } from "utils/configs";

const AccountListAction = (row: Account) => {
  const handleDelete = async (id: number) => {
    const result = await deleteAccount(id);
    if (result.status === "ERROR") {
      errorNotification({
        title: "Error",
        message: result.message,
      });
    } else if (result.status === "SUCCESS") {
      successNotification({
        title: "Success",
        message: result.message,
      });
    }
  };

  return (
    <>
      <Tooltip label="View Account">
        <ActionIcon
          href={`/${DASHBOARD_URL}/accounts/${row.id}/view`}
          component={Link}
          size="sm"
          variant="light"
          mr={rem(3)}
        >
          <IconEye />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Edit Account">
        <ActionIcon
          href={`/${DASHBOARD_URL}/accounts/${row.id}/edit`}
          component={Link}
          size="sm"
          variant="light"
          mr={rem(3)}
        >
          <IconEdit />
        </ActionIcon>
      </Tooltip>
      <DeleteItemActionIcon
        id={row.id}
        itemName={row.code}
        tooltipLabel="Delete This Account"
        handleDelete={handleDelete}
      />
    </>
  );
};

export default AccountListAction;
