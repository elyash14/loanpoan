import { getUser } from "@database/user/data";
import { notFound } from "next/navigation";
import ChangePassword from "./ChangePassword";
import { serializeClient } from "utils/serialize";

type props = {
  id: number;
};

const LoadUserData = async ({ id }: props) => {
  const user = await getUser(id);
  if (!user) {
    notFound();
  }
  return <ChangePassword data={serializeClient(user)} />;
};

export default LoadUserData;
