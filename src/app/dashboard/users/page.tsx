import { PrismaClient } from "@prisma/client";
import { cache } from "react";
import UsersList from "./components/UsersList";

export const getItem = cache(async () => {
  const prisma = new PrismaClient();
  const item = await prisma.user.findFirst();
  return item;
});

export default async function Users() {
  const item = await getItem();
  return (
    <main>
      <h1>Hello Users!</h1>
      <UsersList user={item!} />
    </main>
  );
}
