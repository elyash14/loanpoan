"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedAccountList(
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
                    { name: { contains: search.toLowerCase(), mode: 'insensitive' } },
                    { code: { contains: search.toLowerCase(), mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { firstName: { contains: search.toLowerCase(), mode: 'insensitive' } },
                                { lastName: { contains: search.toLowerCase(), mode: 'insensitive' } },
                            ],
                        }
                    }
                ],
            }
        }

        const [data, total] = await Promise.all([
            prisma.account.findMany({
                select: {
                    id: true,
                    code: true,
                    balance: true,
                    updatedAt: true,
                    installmentFactor: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                        }
                    }
                },
                where,
                take: limit ?? ITEMS_PER_PAGE,
                skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
                orderBy: {
                    [sortBy ?? 'updatedAt']: sortDir == '+' ? 'asc' : 'desc',
                },
            }),
            prisma.account.count({
                where,
            })
        ]);

        return { total, data };
    } catch (error) {
        throw new Error("Failed to load accounts list");
    }
}

export async function getAccount(id: number) {
    try {
        const account = await prisma.account.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
        });
        return account;
    } catch (error) {
        throw new Error("Failed to fetch the account information");
    }
}