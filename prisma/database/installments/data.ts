"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedInstallmentsList(
    page: number,
    limit: number,
    status: string,
    loanId?: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
    accountId?: number) {
    try {
        let where = {};

        // Add account filter if accountId is provided
        if (accountId) {
            where = {
                accountId
            }
        }

        // load all payments of a loan
        if (loanId) {
            where = {
                ...where,
                loanId
            }
        }
        if (status === 'Not Paid') {
            where = {
                ...where,
                payedAt: null
            }
        }
        if (status === 'Paid') {
            where = {
                ...where,
                payedAt: { not: null }
            }
        }

        // if (search) {
        //     where = {
        //         loan: {
        //             account: {
        //                 OR: [
        //                     {
        //                         code: { contains: search.toLowerCase(), mode: 'insensitive' },
        //                     },
        //                     {
        //                         user: {
        //                             OR: [
        //                                 { firstName: { contains: search.toLowerCase(), mode: 'insensitive' } },
        //                                 { lastName: { contains: search.toLowerCase(), mode: 'insensitive' } },
        //                             ],
        //                         }
        //                     }
        //                 ],
        //             },
        //         }
        //     }
        // }

        const [data, total] = await Promise.all([
            prisma.installment.findMany({
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
            prisma.installment.count({
                where,
            })
        ]);

        return { total, data };
    } catch (error) {
        throw new Error("Failed to load payments list");
    }
}
