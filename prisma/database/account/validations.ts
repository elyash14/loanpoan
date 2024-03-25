"use server"

import prisma from "@database/prisma";

export async function checkUniquenessOfCode(code: string, id?: number) {
    const count = await prisma.account.count({
        where: {
            code,
            ...(id && { id: { not: id } })
        }
    });
    return count === 0
}