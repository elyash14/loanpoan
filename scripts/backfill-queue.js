#!/usr/bin/env node
/**
 * Backfill script for Loan Priority Queue.
 * Usage: node scripts/backfill-queue.js
 */
const { createPrismaClient } = require('./lib/prisma-cli');

async function main() {
    const prisma = createPrismaClient();

    try {
        await prisma.$transaction(async (tx) => {
            const count = await tx.loanQueueEntry.count();
            if (count > 0) {
                console.log("Queue already populated. Skipping backfill.");
                return;
            }

            // Fetch all non-deleted accounts
            const accounts = await tx.account.findMany({
                where: { deletedAt: null },
                include: {
                    loans: {
                        select: {
                            status: true,
                            finishedAt: true
                        }
                    }
                }
            });

            // Filter to those with no active loans
            const eligibleAccounts = accounts.filter(account => {
                return !account.loans.some(loan => loan.status === "IN_PROGRESS");
            });

            const mapped = eligibleAccounts.map(account => {
                const completedLoans = account.loans.filter(l => l.status === "FINISHED");
                const completedLoanCount = completedLoans.length;
                
                let joinedAt = account.openedAt || account.createdAt;
                if (completedLoans.length > 0) {
                    const finishedDates = completedLoans
                        .map(l => l.finishedAt)
                        .filter(Boolean);
                    if (finishedDates.length > 0) {
                        joinedAt = new Date(Math.max(...finishedDates.map(d => d.getTime())));
                    }
                }

                return {
                    accountId: account.id,
                    completedLoanCount,
                    joinedAt,
                    openedAt: account.openedAt || account.createdAt
                };
            });

            // Sort based on default rules:
            // 1. Earlier joinedAt (joinedAt asc)
            // 2. Earlier openedAt (openedAt asc)
            // 3. Earlier id (accountId asc)
            mapped.sort((a, b) => {
                const aJoined = a.joinedAt.getTime();
                const bJoined = b.joinedAt.getTime();
                if (aJoined !== bJoined) {
                    return aJoined - bJoined;
                }
                const aOpened = a.openedAt.getTime();
                const bOpened = b.openedAt.getTime();
                if (aOpened !== bOpened) {
                    return aOpened - bOpened;
                }
                return a.accountId - b.accountId;
            });

            // Create the entries with correct contiguous positions
            for (let i = 0; i < mapped.length; i++) {
                await tx.loanQueueEntry.create({
                    data: {
                        accountId: mapped[i].accountId,
                        position: i + 1,
                        completedLoanCount: mapped[i].completedLoanCount,
                        joinedAt: mapped[i].joinedAt,
                    }
                });
            }

            console.log(`Backfilled ${mapped.length} accounts into the loan priority queue.`);
        });
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
