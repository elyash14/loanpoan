import { getUser } from "@database/user/data";
import { listTelegramMembersForSelect } from "@database/telegram/data";
import { notFound } from "next/navigation";
import EditUserTabs from "./EditUserTabs";
import { serializeClient } from "utils/serialize";

type props = {
  id: number;
};

const LoadUserData = async ({ id }: props) => {
  const [user, telegramMembers] = await Promise.all([
    getUser(id),
    listTelegramMembersForSelect(id),
  ]);
  if (!user) {
    notFound();
  }
  return (
    <EditUserTabs
      data={serializeClient(user)}
      telegramMembers={JSON.stringify(telegramMembers)}
    />
  );
};

export default LoadUserData;
