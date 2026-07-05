#!/usr/bin/env node
/**
 * List users (email, role, deletedAt) for debugging login issues.
 * Usage: node scripts/db-list-users.js [search]
 */
const { createPrismaClient } = require('./lib/prisma-cli');

async function main() {
    const search = process.argv[2];
    const prisma = createPrismaClient();

    try {
        const users = await prisma.user.findMany({
            where: search
                ? {
                      OR: [
                          { email: { contains: search, mode: 'insensitive' } },
                          { firstName: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : undefined,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                deletedAt: true,
                createdAt: true,
            },
            orderBy: { id: 'asc' },
        });

        if (users.length === 0) {
            console.log('No users found.');
            return;
        }

        console.table(users);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
