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
    accountId?: number,
    userId?: number) {
    try {
        const now = new Date();
        let where: Record<string, unknown> = {};

        if (accountId) {
            where.accountId = accountId;
        }

        if (userId) {
            where.account = { userId };
        }

        if (loanId) {
            where.loanId = loanId;
        }
        if (status === 'Not Paid') {
            where.paidAt = null;
        }
        if (status === 'Paid') {
            where.paidAt = { not: null };
        }
        if (status === 'Overdue') {
            where.paidAt = null;
            where.dueDate = { lt: now };
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
                                select: { id: true, fullName: true },
                            },
                        },
                    },
                    approvedBy: {
                        select: { id: true, fullName: true },
                    },
                    installmentAmount: {
                        select: { id: true, amount: true },
                    },
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
