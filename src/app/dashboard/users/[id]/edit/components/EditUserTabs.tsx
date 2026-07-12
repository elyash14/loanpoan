"use client";

import { Tabs, rem } from "@mantine/core";
import { IconUser, IconKey } from "@tabler/icons-react";
import EditUserForm from "./EditUserForm";
import ChangePasswordForm from "../../change-password/components/ChangePassword";

type Props = {
  data: string;
  telegramMembers: string;
};

export default function EditUserTabs({ data, telegramMembers }: Props) {
  return (
    <Tabs defaultValue="profile">
      <Tabs.List mb="md">
        <Tabs.Tab value="profile" leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />}>
          Edit Profile
        </Tabs.Tab>
        <Tabs.Tab value="password" leftSection={<IconKey style={{ width: rem(16), height: rem(16) }} />}>
          Reset Password
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        <EditUserForm data={data} telegramMembers={telegramMembers} />
      </Tabs.Panel>

      <Tabs.Panel value="password">
        <ChangePasswordForm data={data} />
      </Tabs.Panel>
    </Tabs>
  );
}
