import prisma from "@database/prisma";
import { getCalendarPeriod, DateType } from "utils/calendarPeriod";
import { getGlobalConfigs } from "@database/config/data";
import type { GlobalConfigType } from "utils/types/configs";

/**
 * Re-evaluates the "Fastest Payer" rewards for a given calendar month and year.
 * Checks all APPROVED PaymentRequests that have at least one NORMAL installment due in that period.
 */
export async function recalculateMonthlyFastPayers(year: number, month: number, dateType: DateType) {
    // 1. Find all APPROVED PaymentRequests
    // We only care about requests that cover NORMAL installments.
    const requests = await prisma.paymentRequest.findMany({
        where: {
            status: "APPROVED",
            installments: {
                some: {
                    type: "NORMAL",
                },
            },
        },
        include: {
            installments: {
                where: { type: "NORMAL" }
            }
        },
        orderBy: {
            createdAt: "asc" // Earliest requests first
        }
    });

    // 2. Filter requests whose installments fall into the target period
    // We group by userId to find their earliest valid request for this period.
    const earliestRequestByUser = new Map<number, typeof requests[0]>();

    for (const req of requests) {
        // Does this request cover an installment in the target year/month?
        const coversTargetPeriod = req.installments.some((inst) => {
            const period = getCalendarPeriod(inst.dueDate, dateType);
            return period.year === year && period.month === month;
        });

        if (coversTargetPeriod) {
            // Because requests are sorted by createdAt ASC, the first one we see
            // for a user is their fastest submission for this period.
            if (!earliestRequestByUser.has(req.userId)) {
                earliestRequestByUser.set(req.userId, req);
            }
        }
    }

    // 3. Sort the distinct users by their earliest request's createdAt
    const fastestUsers = Array.from(earliestRequestByUser.values())
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, 3); // Take top 3

    // 4. Upsert these rewards in UserAchievement
    await prisma.$transaction(async (tx) => {
        // First, delete any existing FASTEST_PAYER achievements for this specific period
        const existingAchievements = await tx.userAchievement.findMany({
            where: {
                type: "FASTEST_PAYER",
            }
        });
        
        const toDeleteIds = existingAchievements.filter(ach => {
            const meta = ach.metadata as { year: number, month: number } | null;
            return meta?.year === year && meta?.month === month;
        }).map(a => a.id);

        if (toDeleteIds.length > 0) {
            await tx.userAchievement.deleteMany({
                where: { id: { in: toDeleteIds } }
            });
        }

        // Insert the top 3
        for (let i = 0; i < fastestUsers.length; i++) {
            const req = fastestUsers[i];
            const rank = i + 1;
            await tx.userAchievement.create({
                data: {
                    userId: req.userId,
                    type: "FASTEST_PAYER",
                    title: `Lightning Payer - Month ${month}`, // Translates in UI based on type
                    metadata: {
                        year,
                        month,
                        rank,
                        paymentRequestId: req.id,
                        submittedAt: req.createdAt.toISOString()
                    }
                }
            });
        }
    });
}
