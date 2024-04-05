import { getUser } from "@database/user/data";
import { notFound } from "next/navigation";
import EditUserForm from "./EditUserForm";

type props = {
  id: number;
};

const LoadUserData = async ({ id }: props) => {
  const user = await getUser(id);
  if (!user) {
    notFound();
  }
  return <EditUserForm data={JSON.stringify(user)} />;
};

export default LoadUserData;
