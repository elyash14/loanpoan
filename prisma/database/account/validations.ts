"use server"

import prisma from "@database/prisma";

export async function checkUniquenessOfCode(code: string) {
    const count = await prisma.account.count({
        where: {
            code,
        }
    });
    return count === 0
}