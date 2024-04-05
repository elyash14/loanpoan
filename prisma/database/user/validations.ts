"use server"

import prisma from "@database/prisma";

export async function checkUserIfNotExist(id: number) {
    const count = await prisma.user.count({
        where: {
            id,
        }
    });
    return count > 0;
}

export async function checkEmailUniqueness(email: string, id?: number){
    const count = await prisma.user.count({
        where: {
            email,
            ...(id && { id: { not: id } })
        }
    });
    return count === 0;
}