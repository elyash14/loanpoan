"use server"

import { RichTableSortDir } from "@dashboard/components/table/interface";
import prisma from "@database/prisma";
import { ITEMS_PER_PAGE } from "utils/configs";

export async function paginatedInstallmentAmountList(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir) {
    try {
        const [data, total] = await Promise.all([
            prisma.installmentAmount.findMany({
                take: limit ?? ITEMS_PER_PAGE,
                skip: (page - 1) * (limit ?? ITEMS_PER_PAGE),
                orderBy: {
                    [sortBy ?? 'updatedAt']: sortDir == '+' ? 'asc' : 'desc',
                },
            }),
            prisma.installmentAmount.count()
        ]);

        return { total, data };
    } catch (error) {
        throw new Error("Failed to load installment amounts list");
    }
}