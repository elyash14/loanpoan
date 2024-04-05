'use server'

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { ITEMS_PER_PAGE } from "utils/configs";


export async function getUser(id: number) {
  try {
      const user = await prisma.user.findUnique({
          where: { id },
         
      });
      return user;
  } catch (error) {
      throw new Error("Failed to fetch the account information");
  }
}

export const getUsers = unstable_cache(
  async (id: number) => {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        gender: true,
        createdAt: true,
      },
    });
  },
  [],
  { tags: ["users-list"] }
);

export async function paginatedUsersList(
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortDir?: RichTableSortDir) {
  try {
    let where = {};
    if (search) {
      where = {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            firstName: {
              contains: search,
            },
          },
          {
            lastName: {
              contains: search,
            },
          },
        ],
      }
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          gender: true,
          createdAt: true,
        },
        where,
        take: limit ?? ITEMS_PER_PAGE,
        skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
        orderBy: {
          [sortBy ?? 'createdAt']: sortDir == '+' ? 'asc' : 'desc',
        },
      }),
      prisma.user.count({
        where,
      })
    ]);

    return { total, data };
  } catch (error) {
    throw new Error("Failed to load users list");
  }
}

export async function searchUserForSelectBox(search: string | null = null, limit: number | null = null) {
  /**
   * search in the database if search present,
   * take limit rows if limit present
   *  */
  try {
    let where = {};
    if (search) {
      where = {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            firstName: {
              contains: search,
            },
          },
          {
            lastName: {
              contains: search,
            },
          },
        ],
      }
    }

    const take = limit ? limit : undefined;
    const orderBy: Prisma.UserOrderByWithRelationInput = limit ? { createdAt: 'desc' } : {};

    const result = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
      },
      take,
      orderBy
    });
    return JSON.stringify(result);
  } catch (error) {
    console.log(error);
    return [];
  }
}
