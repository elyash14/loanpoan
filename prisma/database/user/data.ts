import prisma from "@database/prisma";
import { unstable_cache } from "next/cache";

export const getUsers = unstable_cache(
  async () => {
    return await prisma.user.findMany();
  },
  [],
  { tags: ["users-list"] }
);
