import { getUser } from "@database/user/data";
import { notFound } from "next/navigation";
import ChangePassword from "./ChangePassword";

type props = {
  id: number;
};

const LoadUserData = async ({ id }: props) => {
  const user = await getUser(id);
  if (!user) {
    notFound();
  }
  return <ChangePassword data={JSON.stringify(user)} />;
};

export default LoadUserData;
