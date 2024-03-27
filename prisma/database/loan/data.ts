"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedLoanList(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir) {
    // try {
    let where = {};
    // if (search) {
    //     where = {
    //         OR: [
    //             { name: { contains: search.toLowerCase(), mode: 'insensitive' } },
    //             { code: { contains: search.toLowerCase(), mode: 'insensitive' } },
    //             {
    //                 user: {
    //                     OR: [
    //                         { firstName: { contains: search.toLowerCase(), mode: 'insensitive' } },
    //                         { lastName: { contains: search.toLowerCase(), mode: 'insensitive' } },
    //                     ],
    //                 }
    //             }
    //         ],
    //     }
    // }

    const [data, total] = await Promise.all([
        prisma.loan.findMany({
            where,
            include: {
                account: {
                    include: {
                        user: {
                            select: { id: true, fullName: true }
                        }
                    }
                }
            },
            take: limit ?? ITEMS_PER_PAGE,
            skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
            orderBy: {
                [sortBy ?? 'createdAt']: sortDir == '+' ? 'asc' : 'desc',
            },
        }),
        prisma.loan.count({
            where,
        })
    ]);

    return { total, data };
    // } catch (error) {
    //     throw new Error("Failed to load loans list");
    // }
}
