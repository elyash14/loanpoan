import prisma from "@database/prisma";

/**
 * Recalculates and stores the user's punctuality score in UserAchievement.
 * Score = on-time paid items − (late paid items + currently overdue unpaid items)
 */
export async function recalculateUserPunctuality(userId: number) {
    const accountWhere = { userId, deletedAt: null };
    const now = new Date();

    const [
        onTimeInstallments,
        onTimePayments,
        latePaidInstallments,
        latePaidPayments,
        overdueUnpaidInstallments,
        overdueUnpaidPayments,
    ] = await Promise.all([
        prisma.installment.count({
            where: {
                account: accountWhere,
                paidAt: { not: null },
                dueDate: { gte: prisma.installment.fields.paidAt },
            },
        }),
        prisma.payment.count({
            where: {
                loan: { account: accountWhere },
                paidAt: { not: null },
                dueDate: { gte: prisma.payment.fields.paidAt },
            },
        }),
        prisma.installment.count({
            where: {
                account: accountWhere,
                paidAt: { not: null, gt: prisma.installment.fields.dueDate },
            },
        }),
        prisma.payment.count({
            where: {
                loan: { account: accountWhere },
                paidAt: { not: null, gt: prisma.payment.fields.dueDate },
            },
        }),
        prisma.installment.count({
            where: {
                account: accountWhere,
                paidAt: null,
                dueDate: { lt: now },
            },
        }),
        prisma.payment.count({
            where: {
                loan: { account: accountWhere },
                paidAt: null,
                dueDate: { lt: now },
            },
        }),
    ]);

    const score =
        onTimeInstallments +
        onTimePayments -
        (latePaidInstallments + latePaidPayments + overdueUnpaidInstallments + overdueUnpaidPayments);

    const existing = await prisma.userAchievement.findFirst({
        where: { userId, type: "PUNCTUALITY" },
        select: { id: true },
    });

    const metadata = {
        score,
        onTime: onTimeInstallments + onTimePayments,
        late: latePaidInstallments + latePaidPayments,
        overdueUnpaid: overdueUnpaidInstallments + overdueUnpaidPayments,
        updatedAt: new Date().toISOString(),
    };

    if (existing) {
        await prisma.userAchievement.update({
            where: { id: existing.id },
            data: {
                title: "Punctuality Score",
                metadata,
            },
        });
    } else {
        await prisma.userAchievement.create({
            data: {
                userId,
                type: "PUNCTUALITY",
                title: "Punctuality Score",
                metadata,
            },
        });
    }

    return score;
}

export function getPunctualityScoreFromAchievements(
    achievements: Array<{ type: string; metadata: unknown }>,
): number {
    const row = achievements.find((a) => a.type === "PUNCTUALITY");
    if (!row) return 0;
    const meta = row.metadata as { score?: number } | null;
    return typeof meta?.score === "number" ? meta.score : 0;
}
