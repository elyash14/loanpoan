import prisma from "@database/prisma";

export type LoanPriorityEntry = {
  id: number;
  position: number;
  accountId: number;
  accountCode: string;
  userId: number;
  userFullName: string;
  completedLoanCount: number;
  joinedAt: Date;
  isManualPosition: boolean;
  manualNote: string | null;
  balance: string;
};

/**
 * Internal helper to renumber queue positions consecutively from 1 to N.
 */
async function renumberQueuePositions(tx: any) {
  const entries = await tx.loanQueueEntry.findMany({
    orderBy: { position: 'asc' }
  });

  for (let i = 0; i < entries.length; i++) {
    const expectedPos = i + 1;
    if (entries[i].position !== expectedPos) {
      await tx.loanQueueEntry.update({
        where: { id: entries[i].id },
        data: { position: expectedPos }
      });
    }
  }
}

/**
 * Computes where a new candidate account would automatically land in the queue
 * based on default priority rules.
 */
async function computeAutoInsertPosition(accountId: number, tx: any) {
  const candidateAccount = await tx.account.findUnique({
    where: { id: accountId },
    include: {
      loans: {
        where: { status: "FINISHED" }
      }
    }
  });

  if (!candidateAccount) {
    throw new Error(`Account ${accountId} not found`);
  }

  const completedCount = candidateAccount.loans.length;
  const openedAtTime = candidateAccount.openedAt ? candidateAccount.openedAt.getTime() : candidateAccount.createdAt.getTime();
  const candidateJoinedAt = new Date().getTime();

  // Fetch all existing entries
  const existingEntries = await tx.loanQueueEntry.findMany({
    include: {
      account: {
        select: {
          openedAt: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      position: 'asc'
    }
  });

  let targetPosition = existingEntries.length + 1;
  for (const entry of existingEntries) {
    const entryJoined = entry.joinedAt.getTime();
    const entryOpened = (entry.account.openedAt || entry.account.createdAt).getTime();

    let isCandidateEarlier = false;

    if (candidateJoinedAt < entryJoined) {
      isCandidateEarlier = true;
    } else if (candidateJoinedAt === entryJoined) {
      if (openedAtTime < entryOpened) {
        isCandidateEarlier = true;
      } else if (openedAtTime === entryOpened) {
        if (accountId < entry.accountId) {
          isCandidateEarlier = true;
        }
      }
    }

    if (isCandidateEarlier) {
      targetPosition = entry.position;
      break;
    }
  }

  return { targetPosition, completedCount };
}

/**
 * Adds an account to the loan priority queue if eligible.
 */
export async function enqueueAccount(accountId: number) {
  await prisma.$transaction(async (tx) => {
    // Check if account exists, is active (not deleted) and has no active loan
    const account = await tx.account.findFirst({
      where: { id: accountId, deletedAt: null },
      include: {
        loans: {
          where: { status: "IN_PROGRESS" }
        }
      }
    });

    if (!account) return;
    if (account.loans.length > 0) return; // Account has an active loan, so not eligible for the queue

    // Check if already in queue
    const existing = await tx.loanQueueEntry.findUnique({
      where: { accountId }
    });
    if (existing) return;

    // Compute insertion position based on default rules
    const { targetPosition, completedCount } = await computeAutoInsertPosition(accountId, tx);

    // Shift positions of elements from targetPosition onwards
    await tx.loanQueueEntry.updateMany({
      where: { position: { gte: targetPosition } },
      data: { position: { increment: 1 } }
    });

    // Insert new entry
    await tx.loanQueueEntry.create({
      data: {
        accountId,
        position: targetPosition,
        completedLoanCount: completedCount,
        joinedAt: new Date(),
      }
    });

    // Ensure positions are perfectly contiguous starting from 1
    await renumberQueuePositions(tx);
  });
}

/**
 * Removes an account from the loan priority queue (e.g. when a new loan is created).
 */
export async function dequeueAccount(accountId: number) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.loanQueueEntry.findUnique({
      where: { accountId }
    });
    if (!existing) return;

    // Delete the entry
    await tx.loanQueueEntry.delete({
      where: { id: existing.id }
    });

    // Shift positions of elements that were after the deleted one
    await tx.loanQueueEntry.updateMany({
      where: { position: { gt: existing.position } },
      data: { position: { decrement: 1 } }
    });

    // Ensure positions are contiguous
    await renumberQueuePositions(tx);
  });
}

/**
 * Reorders a loan queue entry to a new position, updating other entry positions around it.
 */
export async function reorderLoanQueueEntry(
  accountId: number,
  newPosition: number,
  adminUserId?: number,
  note?: string
) {
  await prisma.$transaction(async (tx) => {
    const entry = await tx.loanQueueEntry.findUnique({
      where: { accountId }
    });
    if (!entry) throw new Error("Queue entry not found");

    const totalCount = await tx.loanQueueEntry.count();
    const targetPos = Math.max(1, Math.min(newPosition, totalCount));
    const oldPosition = entry.position;

    if (targetPos === oldPosition) return;

    // Set position of the moved entry temporarily to 0 to avoid unique constraint violations
    await tx.loanQueueEntry.update({
      where: { id: entry.id },
      data: { position: 0 }
    });

    if (targetPos < oldPosition) {
      // Moving up: increment position of entries in between
      await tx.loanQueueEntry.updateMany({
        where: {
          position: {
            gte: targetPos,
            lt: oldPosition
          }
        },
        data: { position: { increment: 1 } }
      });
    } else {
      // Moving down: decrement position of entries in between
      await tx.loanQueueEntry.updateMany({
        where: {
          position: {
            gt: oldPosition,
            lte: targetPos
          }
        },
        data: { position: { decrement: 1 } }
      });
    }

    // Now set the target position on the moved entry and mark as manual
    await tx.loanQueueEntry.update({
      where: { id: entry.id },
      data: {
        position: targetPos,
        isManualPosition: true,
        adjustedById: adminUserId ?? null,
        manualNote: note ?? null
      }
    });

    // Ensure positions are perfectly contiguous
    await renumberQueuePositions(tx);
  });
}

/**
 * Resets the entire loan priority queue back to automatic sorting rules,
 * clearing any manual override flags.
 */
export async function resetLoanQueueToAuto() {
  await prisma.$transaction(async (tx) => {
    const entries = await tx.loanQueueEntry.findMany({
      include: {
        account: {
          select: {
            id: true,
            openedAt: true,
            createdAt: true
          }
        }
      }
    });

    // Sort entries based on default rules:
    // 1. joinedAt (asc)
    // 2. openedAt (asc)
    // 3. accountId (asc)
    const sorted = [...entries].sort((a, b) => {
      const aJoined = a.joinedAt.getTime();
      const bJoined = b.joinedAt.getTime();
      if (aJoined !== bJoined) {
        return aJoined - bJoined;
      }
      const aOpened = (a.account.openedAt || a.account.createdAt).getTime();
      const bOpened = (b.account.openedAt || b.account.createdAt).getTime();
      if (aOpened !== bOpened) {
        return aOpened - bOpened;
      }
      return a.accountId - b.accountId;
    });

    // Set all positions temporarily to 0 to avoid unique constraint violations
    await tx.loanQueueEntry.updateMany({
      data: { position: 0 }
    });

    // Save sorted positions sequentially
    for (let i = 0; i < sorted.length; i++) {
      await tx.loanQueueEntry.update({
        where: { id: sorted[i].id },
        data: {
          position: i + 1,
          isManualPosition: false,
          adjustedById: null,
          manualNote: null
        }
      });
    }
  });
}

/**
 * Fetches the complete priority queue.
 */
export async function getLoanPriorityQueue(): Promise<LoanPriorityEntry[]> {
  try {
    const entries = await prisma.loanQueueEntry.findMany({
      where: {
        account: {
          deletedAt: null
        }
      },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            balance: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    });

    return entries.map(entry => ({
      id: entry.id,
      position: entry.position,
      accountId: entry.accountId,
      accountCode: entry.account.code,
      userId: entry.account.user.id,
      userFullName: `${entry.account.user.firstName} ${entry.account.user.lastName}`,
      completedLoanCount: entry.completedLoanCount,
      joinedAt: entry.joinedAt,
      isManualPosition: entry.isManualPosition,
      manualNote: entry.manualNote,
      balance: entry.account.balance.toString()
    }));
  } catch (error) {
    console.error("Error loading loan priority queue:", error);
    throw new Error("Failed to load loan priority queue");
  }
}

/**
 * Gets a user's queue position summary (for user home panel).
 */
export async function getUserLoanQueueSummary(userId: number) {
  try {
    const totalEligible = await prisma.loanQueueEntry.count({
      where: {
        account: {
          deletedAt: null
        }
      }
    });
    
    // Find all queue entries for this user's accounts
    const userEntries = await prisma.loanQueueEntry.findMany({
      where: {
        account: {
          userId,
          deletedAt: null
        }
      },
      orderBy: {
        position: 'asc'
      }
    });

    if (userEntries.length === 0) {
      return null;
    }

    // Best position is the minimum position
    const bestEntry = userEntries[0];

    return {
      position: bestEntry.position,
      totalEligible,
      eligibleAccounts: userEntries.map(e => ({
        accountId: e.accountId,
        position: e.position,
        joinedAt: e.joinedAt
      }))
    };
  } catch (error) {
    console.error("Error getting user loan queue summary:", error);
    return null;
  }
}

/**
 * Backfills the queue from current eligible accounts.
 * Safe to run multiple times: only processes if table is empty.
 */
export async function backfillLoanQueue() {
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
          .filter(Boolean) as Date[];
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
}
