import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { User } from "@prisma/client";
import { IconBrandSamsungpass, IconEdit, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";

const UserListAction = (row: User) => {
  return (
    <>
      <Tooltip label="View User">
        <ActionIcon
          href={`/${DASHBOARD_URL}/users/${row.id}/view`}
          component={Link}
          size="sm"
          variant="light"
          mr={rem(3)}
        >
          <IconEye />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Edit User">
        <ActionIcon
          href={`/${DASHBOARD_URL}/users/${row.id}/edit`}
          component={Link}
          size="sm"
          variant="light"
          mr={rem(3)}
        >
          <IconEdit />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Change Password">
        <ActionIcon
          href={`/${DASHBOARD_URL}/users/${row.id}/change-password`}
          component={Link}
          size="sm"
          variant="light"
          mr={rem(3)}
        >
          <IconBrandSamsungpass />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default UserListAction;
