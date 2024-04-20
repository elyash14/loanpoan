"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedInstallmentList(
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
                    { accountId: { contains: search.toLowerCase(), mode: 'insensitive' } },
                    { installmentAmountId: { contains: search.toLowerCase(), mode: 'insensitive' } },
                   
                ],
            }
        }

        const [data, total] = await Promise.all([
            prisma.installment.findMany({
                select: {
                    id: true,
                    installmentAmountId: true,
                    accountId: true,
                    amount: true,
                    type: true,
                    approvedById:true,
                    createdAt:true,
                    approvedAt:true
                },
                where,
                take: limit ?? ITEMS_PER_PAGE,
                skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
                orderBy: {
                    [sortBy ?? 'approvedAt']: sortDir == '+' ? 'asc' : 'desc',
                },
            }),
            prisma.installment.count({
                where,
            })
        ]);
            
        return { total, data };

    } catch (error) {
        console.error(error);
        throw new Error("Failed to load installments list");
    }
}