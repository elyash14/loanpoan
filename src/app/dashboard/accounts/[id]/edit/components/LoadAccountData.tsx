import { getAccount } from "@database/account/data";
import { notFound } from "next/navigation";
import EditAccountForm from "./EditAccountForm";

type props = {
  id: number;
};

const LoadAccountData = async ({ id }: props) => {
  const account = await getAccount(id);
  if (!account) {
    notFound();
  }
  return <EditAccountForm data={JSON.stringify(account)} />;
};

export default LoadAccountData;
