"use server";

import prisma from "@database/prisma";
import { paginatedLoanList } from "@database/loan/data";
import { paginatedInstallmentsList } from "@database/installments/data";
import { paginatedPaymentsList } from "@database/payment/data";
import { RichTableSortDir } from "@dashboard/components/table/interface";
import { notFound } from "next/navigation";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";

function decimalToString(value: { toString(): string } | null | undefined): string {
    return value?.toString() ?? "0";
}

type DueItem = {
    amount: { toString(): string };
    dueDate: Date;
};

function sumAmount(items: DueItem[]): string {
    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
    return String(Math.round(total));
}

function findSoonestDue(items: DueItem[]): { dueDate: string; amount: string } | null {
    if (!items.length) return null;
    const soonest = items.reduce((best, item) =>
        item.dueDate < best.dueDate ? item : best,
    );
    return {
        dueDate: soonest.dueDate.toISOString(),
        amount: decimalToString(soonest.amount),
    };
}

type UserLoanStats = {
    userId: number;
    loanCount: number;
    loanAmount: number;
};

function buildUserLoanRankings(panelUsers: UserLoanStats[], userId: number) {
    const stats = panelUsers;
    const totalUsers = stats.length;
    const userStat = stats.find((row) => row.userId === userId);

    if (!userStat || totalUsers === 0) {
        return null;
    }

    const positionIn = (sorted: UserLoanStats[]) => {
        const index = sorted.findIndex((row) => row.userId === userId);
        return index >= 0 ? index + 1 : totalUsers;
    };

    const byCount = [...stats].sort((a, b) => {
        if (b.loanCount !== a.loanCount) return b.loanCount - a.loanCount;
        if (b.loanAmount !== a.loanAmount) return b.loanAmount - a.loanAmount;
        return a.userId - b.userId;
    });

    const byAmount = [...stats].sort((a, b) => {
        if (b.loanAmount !== a.loanAmount) return b.loanAmount - a.loanAmount;
        if (b.loanCount !== a.loanCount) return b.loanCount - a.loanCount;
        return a.userId - b.userId;
    });

    return {
        byCount: {
            position: positionIn(byCount),
            totalUsers,
            loanCount: userStat.loanCount,
        },
        byAmount: {
            position: positionIn(byAmount),
            totalUsers,
            loanAmount: String(Math.round(userStat.loanAmount)),
        },
    };
}

export async function getUserHomeDashboard(userId: number) {
    const now = new Date();
    const accountWhere = { userId, deletedAt: null };
    const overdueWhere = { paidAt: null, dueDate: { lt: now } };
    const upcomingWhere = { paidAt: null, dueDate: { gte: now } };

    const [
        balanceSum,
        overdueInstallments,
        overduePayments,
        upcomingInstallments,
        upcomingPayments,
        activeLoan,
        userEligibleAccounts,
        allEligibleAccounts,
        onTimeInstallments,
        onTimePayments,
        latePaidInstallments,
        latePaidPayments,
        panelUsers,
        globalBankBalance,
        totalLoanCount,
        activeLoanCount,
        totalLoanAmount,
        activeLoanAmount,
        activeLoanMemberCount,
    ] = await Promise.all([
        prisma.account.aggregate({
            _sum: { balance: true },
            where: accountWhere,
        }),
        prisma.installment.findMany({
            where: { ...overdueWhere, account: accountWhere },
            select: { amount: true, dueDate: true },
        }),
        prisma.payment.findMany({
            where: { ...overdueWhere, loan: { account: accountWhere } },
            select: { amount: true, dueDate: true },
        }),
        prisma.installment.findMany({
            where: { ...upcomingWhere, account: accountWhere },
            select: { amount: true, dueDate: true },
        }),
        prisma.payment.findMany({
            where: { ...upcomingWhere, loan: { account: accountWhere } },
            select: { amount: true, dueDate: true },
        }),
        prisma.loan.findFirst({
            where: {
                status: "IN_PROGRESS",
                account: accountWhere,
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                amount: true,
                paymentCount: true,
                account: { select: { id: true, code: true } },
                payments: {
                    select: { amount: true, paidAt: true },
                },
            },
        }),
        prisma.account.findMany({
            where: {
                ...accountWhere,
                loans: { none: { status: "IN_PROGRESS" } },
            },
            select: { id: true },
        }),
        prisma.account.findMany({
            where: {
                deletedAt: null,
                loans: { none: { status: "IN_PROGRESS" } },
            },
            select: {
                id: true,
                userId: true,
                openedAt: true,
                _count: { select: { loans: true } },
            },
        }),
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
                paidAt: { not: null, gt: prisma.payment.fields.paidAt },
            },
        }),
        prisma.user.findMany({
            where: { deletedAt: null, role: "USER" },
            select: {
                id: true,
                accounts: {
                    where: { deletedAt: null },
                    select: {
                        loans: { select: { amount: true } },
                    },
                },
            },
        }),
        prisma.account.aggregate({
            _sum: { balance: true },
            where: { deletedAt: null },
        }),
        prisma.loan.count(),
        prisma.loan.count({ where: { status: "IN_PROGRESS" } }),
        prisma.loan.aggregate({ _sum: { amount: true } }),
        prisma.loan.aggregate({
            _sum: { amount: true },
            where: { status: "IN_PROGRESS" },
        }),
        prisma.user.count({
            where: {
                deletedAt: null,
                role: "USER",
                accounts: {
                    some: {
                        deletedAt: null,
                        loans: {
                            some: { status: "IN_PROGRESS" },
                        },
                    },
                },
            },
        }),
    ]);

    const overdueItems = [...overdueInstallments, ...overduePayments];
    const upcomingItems = [...upcomingInstallments, ...upcomingPayments];

    const notice = {
        overdueCount: overdueItems.length,
        overdueAmount: sumAmount(overdueItems),
        upcomingCount: upcomingItems.length,
        upcomingAmount: sumAmount(upcomingItems),
        nextDue: findSoonestDue(upcomingItems),
    };

    let activeLoanSnapshot: {
        id: number;
        accountCode: string;
        accountId: number;
        amount: string;
        paidCount: number;
        paymentCount: number;
        progressPercent: number;
        remainingAmount: string;
    } | null = null;

    if (activeLoan?.account) {
        const paidPayments = activeLoan.payments.filter((row) => row.paidAt);
        const unpaidAmount = activeLoan.payments
            .filter((row) => !row.paidAt)
            .reduce((sum, row) => sum + Number(row.amount), 0);
        const paidCount = paidPayments.length;
        const progressPercent = activeLoan.paymentCount > 0
            ? Math.min(100, Math.round((paidCount / activeLoan.paymentCount) * 100))
            : 0;

        activeLoanSnapshot = {
            id: activeLoan.id,
            accountCode: activeLoan.account.code,
            accountId: activeLoan.account.id,
            amount: decimalToString(activeLoan.amount),
            paidCount,
            paymentCount: activeLoan.paymentCount,
            progressPercent,
            remainingAmount: String(Math.round(unpaidAmount)),
        };
    }

    const rankedEligible = [...allEligibleAccounts].sort((a, b) => {
        if (a._count.loans !== b._count.loans) {
            return a._count.loans - b._count.loans;
        }
        const aOpened = a.openedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bOpened = b.openedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aOpened - bOpened;
    });

    const userEligibleIds = new Set(userEligibleAccounts.map((row) => row.id));
    const positions = rankedEligible
        .map((row, index) => ({ accountId: row.id, position: index + 1 }))
        .filter((row) => userEligibleIds.has(row.accountId));

    const queue = positions.length
        ? {
            position: positions[0].position,
            totalEligible: rankedEligible.length,
        }
        : null;

    const overdueUnpaidCount = overdueItems.length;
    const punctualityScore =
        onTimeInstallments + onTimePayments - (latePaidInstallments + latePaidPayments + overdueUnpaidCount);

    const userLoanStats: UserLoanStats[] = panelUsers.map((user) => {
        const loans = user.accounts.flatMap((account) => account.loans);
        return {
            userId: user.id,
            loanCount: loans.length,
            loanAmount: loans.reduce((sum, loan) => sum + Number(loan.amount), 0),
        };
    });

    const loanRanking = buildUserLoanRankings(userLoanStats, userId);

    const globalStats = {
        totalBankBalance: decimalToString(globalBankBalance._sum.balance),
        totalLoanCount,
        activeLoanCount,
        totalLoanAmount: decimalToString(totalLoanAmount._sum.amount),
        activeLoanAmount: decimalToString(activeLoanAmount._sum.amount),
        memberCount: panelUsers.length,
        activeLoanMemberCount,
    };

    return {
        totalBalance: decimalToString(balanceSum._sum.balance),
        notice,
        activeLoan: activeLoanSnapshot,
        queue,
        punctualityScore,
        loanRanking,
        globalStats,
    };
}

export async function getUserAccountIfOwned(userId: number, accountId: number) {
    const now = new Date();

    const account = await prisma.account.findFirst({
        where: { id: accountId, userId, deletedAt: null },
        select: {
            id: true,
            code: true,
            name: true,
            balance: true,
            openedAt: true,
            installmentFactor: true,
            _count: { select: { loans: true, installments: true } },
            loans: {
                where: { status: "IN_PROGRESS" },
                take: 1,
                select: {
                    id: true,
                    amount: true,
                    status: true,
                },
            },
        },
    });
    if (!account) notFound();

    const [
        unpaidInstallments,
        latestInstallments,
        latestPayments,
        latestLoans,
    ] = await Promise.all([
        prisma.installment.count({
            where: { accountId, paidAt: null },
        }),
        prisma.installment.findMany({
            where: { accountId },
            orderBy: { dueDate: "desc" },
            take: 5,
            select: { id: true, amount: true, dueDate: true, paidAt: true },
        }),
        prisma.payment.findMany({
            where: { loan: { accountId } },
            orderBy: { dueDate: "desc" },
            take: 5,
            select: { id: true, amount: true, dueDate: true, paidAt: true, loanId: true },
        }),
        prisma.loan.findMany({
            where: { accountId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, amount: true, startedAt: true, createdAt: true, status: true },
        }),
    ]);

    const activities = [
        ...latestInstallments.map((row) => {
            const when = row.paidAt ?? row.dueDate;
            const overdue = !row.paidAt && row.dueDate < now;
            return {
                id: `installment-${row.id}`,
                at: when.toISOString(),
                type: row.paidAt ? "installment-paid" : overdue ? "installment-overdue" : "installment-due",
                amount: decimalToString(row.amount),
                href: `/installments?account=${accountId}&from=account&fromAccount=${accountId}`,
            };
        }),
        ...latestPayments.map((row) => {
            const when = row.paidAt ?? row.dueDate;
            const overdue = !row.paidAt && row.dueDate < now;
            return {
                id: `payment-${row.id}`,
                at: when.toISOString(),
                type: row.paidAt ? "payment-paid" : overdue ? "payment-overdue" : "payment-due",
                amount: decimalToString(row.amount),
                href: row.loanId
                    ? `/payments?loan=${row.loanId}&from=loan&fromLoan=${row.loanId}`
                    : "/payments?from=more",
            };
        }),
        ...latestLoans.map((row) => ({
            id: `loan-${row.id}`,
            at: (row.startedAt ?? row.createdAt).toISOString(),
            type: row.status === "IN_PROGRESS" ? "loan-active" : "loan-finished",
            amount: decimalToString(row.amount),
            href: `/loans/${row.id}`,
        })),
    ]
        .sort((a, b) => +new Date(b.at) - +new Date(a.at))
        .slice(0, 8);

    return {
        ...account,
        kpis: {
            unpaidInstallments,
        },
        activities,
    };
}

export async function getUserLoanIfOwned(userId: number, loanId: number) {
    const loan = await prisma.loan.findFirst({
        where: { id: loanId, account: { userId } },
        select: {
            id: true,
            description: true,
            amount: true,
            status: true,
            paymentCount: true,
            createdAt: true,
            startedAt: true,
            finishedAt: true,
            account: { select: { id: true, code: true, name: true } },
            payments: {
                select: {
                    id: true,
                    amount: true,
                    dueDate: true,
                    paidAt: true,
                },
                orderBy: { dueDate: "asc" },
            },
        },
    });
    if (!loan) notFound();

    const now = new Date();
    const payments = loan.payments;
    const paidPayments = payments.filter((row) => row.paidAt);
    const overduePayments = payments.filter((row) => !row.paidAt && row.dueDate < now);
    const unpaidPayments = payments.filter((row) => !row.paidAt);
    const upcomingUnpaidPayments = payments.filter((row) => !row.paidAt && row.dueDate >= now);

    const paidAmount = paidPayments.reduce((sum, row) => sum + Number(row.amount), 0);
    const unpaidAmount = unpaidPayments.reduce((sum, row) => sum + Number(row.amount), 0);
    const overdueAmount = overduePayments.reduce((sum, row) => sum + Number(row.amount), 0);
    const remainingAmount = unpaidAmount;
    const paidCount = paidPayments.length;
    const progressPercent = loan.paymentCount > 0
        ? Math.min(100, Math.round((paidCount / loan.paymentCount) * 100))
        : 0;

    const timeline = payments
        .map((row) => {
            const overdue = !row.paidAt && row.dueDate < now;
            const at = row.paidAt ?? row.dueDate;
            return {
                id: `payment-${row.id}`,
                type: row.paidAt ? "payment-paid" : overdue ? "payment-overdue" : "payment-upcoming",
                at: at.toISOString(),
                amount: decimalToString(row.amount),
                href: `/payments?loan=${loan.id}&from=loan&fromLoan=${loan.id}`,
            };
        })
        .sort((a, b) => +new Date(b.at) - +new Date(a.at))
        .slice(0, 8);

    return {
        ...loan,
        stats: {
            paidCount,
            unpaidCount: unpaidPayments.length,
            overdueCount: overduePayments.length,
            paidAmount: String(Math.round(paidAmount)),
            unpaidAmount: String(Math.round(unpaidAmount)),
            overdueAmount: String(Math.round(overdueAmount)),
            remainingAmount: String(Math.round(remainingAmount)),
            progressPercent,
        },
        charts: {
            statusBreakdown: {
                paid: paidPayments.length,
                unpaid: upcomingUnpaidPayments.length,
                overdue: overduePayments.length,
            },
        },
        timeline,
    };
}

export async function paginatedUserAccounts(
    userId: number,
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
) {
    let where: Record<string, unknown> = { userId, deletedAt: null };

    if (search) {
        where = {
            ...where,
            OR: [
                { name: { contains: search.toLowerCase(), mode: "insensitive" } },
                { code: { contains: search.toLowerCase(), mode: "insensitive" } },
            ],
        };
    }

    const [data, total] = await Promise.all([
        prisma.account.findMany({
            select: {
                id: true,
                code: true,
                name: true,
                balance: true,
                openedAt: true,
                loans: {
                    where: { status: "IN_PROGRESS" },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                    },
                },
            },
            where,
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
                [sortBy ?? "openedAt"]: sortDir === "+" ? "asc" : "desc",
            },
        }),
        prisma.account.count({ where }),
    ]);

    return { total, data };
}

export async function loadMoreUserAccounts(options: {
    page: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
}) {
    const userId = await getPanelUserId();
    if (!userId) {
        return { data: [], total: 0, hasMore: false };
    }

    const limit = options.limit ?? ITEMS_PER_PAGE;
    const { data, total } = await paginatedUserAccounts(
        userId,
        options.page,
        limit,
        options.search,
        options.sortBy,
        options.sortDir,
    );

    return {
        data: data.map((row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            balance: decimalToString(row.balance),
            openedAt: row.openedAt?.toISOString() ?? null,
            loans: row.loans.map((loan) => ({
                id: loan.id,
                amount: decimalToString(loan.amount),
                status: loan.status,
            })),
        })),
        total,
        hasMore: options.page * limit < total,
    };
}

export async function paginatedUserLoans(
    userId: number,
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
    status?: string,
) {
    return paginatedLoanList(page, limit, search, sortBy, sortDir, undefined, userId, status);
}

export async function loadMoreUserLoans(options: {
    page: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
    status?: string;
}) {
    const userId = await getPanelUserId();
    if (!userId) {
        return { data: [], total: 0, hasMore: false };
    }

    const limit = options.limit ?? ITEMS_PER_PAGE;
    const { data, total } = await paginatedUserLoans(
        userId,
        options.page,
        limit,
        options.search,
        options.sortBy,
        options.sortDir,
        options.status,
    );

    return {
        data: data
            .filter((row) => row.account)
            .map((row) => ({
                id: row.id,
                amount: decimalToString(row.amount),
                status: row.status,
                createdAt: row.createdAt.toISOString(),
                account: {
                    id: row.account!.id,
                    code: row.account!.code,
                },
            })),
        total,
        hasMore: options.page * limit < total,
    };
}

export async function paginatedUserInstallments(
    userId: number,
    page: number,
    limit: number,
    status: string,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
    accountId?: number,
) {
    return paginatedInstallmentsList(
        page, limit, status, undefined, search, sortBy, sortDir, accountId, userId,
    );
}

export async function loadMoreUserInstallments(options: {
    page: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
    accountId?: number;
}) {
    const userId = await getPanelUserId();
    if (!userId) {
        return { data: [], total: 0, hasMore: false };
    }

    const limit = options.limit ?? ITEMS_PER_PAGE;
    const { data, total } = await paginatedUserInstallments(
        userId,
        options.page,
        limit,
        options.status ?? "",
        options.search,
        options.sortBy,
        options.sortDir,
        options.accountId,
    );

    return {
        data: data
            .filter((row) => row.account)
            .map((row) => ({
                id: row.id,
                amount: decimalToString(row.amount),
                dueDate: row.dueDate.toISOString(),
                paidAt: row.paidAt?.toISOString() ?? null,
                account: {
                    id: row.account!.id,
                    code: row.account!.code,
                    name: row.account!.name,
                },
            })),
        total,
        hasMore: options.page * limit < total,
    };
}

export async function getUserAccountFilterOptions(userId: number) {
    return prisma.account.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, code: true, name: true, installmentFactor: true },
        orderBy: { code: "asc" },
    });
}

export async function getUserInstallmentsSummary(userId: number, accountId?: number) {
    const now = new Date();
    const baseWhere = {
        account: { userId },
        ...(accountId ? { accountId } : {}),
    };

    const [total, paid, overdue] = await Promise.all([
        prisma.installment.count({ where: baseWhere }),
        prisma.installment.count({ where: { ...baseWhere, paidAt: { not: null } } }),
        prisma.installment.count({
            where: { ...baseWhere, paidAt: null, dueDate: { lt: now } },
        }),
    ]);

    const unpaid = total - paid;
    const upcoming = unpaid - overdue;

    return { total, paid, unpaid, overdue, upcoming };
}

export async function paginatedUserPayments(
    userId: number,
    page: number,
    limit: number,
    status: string,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
    loanId?: number,
) {
    return paginatedPaymentsList(page, limit, status, loanId, search, sortBy, sortDir, userId);
}

export async function getUserLoanFilterOptions(userId: number) {
    return prisma.loan.findMany({
        where: { account: { userId, deletedAt: null } },
        select: {
            id: true,
            account: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getUserPaymentsSummary(userId: number, loanId?: number) {
    const now = new Date();
    const baseWhere = {
        loan: { account: { userId } },
        ...(loanId ? { loanId } : {}),
    };

    const [total, paid, overdue] = await Promise.all([
        prisma.payment.count({ where: baseWhere }),
        prisma.payment.count({ where: { ...baseWhere, paidAt: { not: null } } }),
        prisma.payment.count({
            where: { ...baseWhere, paidAt: null, dueDate: { lt: now } },
        }),
    ]);

    const unpaid = total - paid;
    const upcoming = unpaid - overdue;

    return { total, paid, unpaid, overdue, upcoming };
}

export async function loadMoreUserPayments(options: {
    page: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
    loanId?: number;
}) {
    const userId = await getPanelUserId();
    if (!userId) {
        return { data: [], total: 0, hasMore: false };
    }

    const limit = options.limit ?? ITEMS_PER_PAGE;
    const { data, total } = await paginatedUserPayments(
        userId,
        options.page,
        limit,
        options.status ?? "",
        options.search,
        options.sortBy,
        options.sortDir,
        options.loanId,
    );

    return {
        data: data
            .filter((row) => row.loan?.account)
            .map((row) => ({
                id: row.id,
                amount: decimalToString(row.amount),
                dueDate: row.dueDate.toISOString(),
                paidAt: row.paidAt?.toISOString() ?? null,
                loan: {
                    id: row.loan!.id,
                    account: {
                        id: row.loan!.account!.id,
                        code: row.loan!.account!.code,
                        name: row.loan!.account!.name,
                    },
                },
            })),
        total,
        hasMore: options.page * limit < total,
    };
}

export async function getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true,
            gender: true,
            cardNumber: true,
            accountNumber: true,
            telegramId: true,
            telegramUsername: true,
            avatar: true,
            profileColor: true,
            createdAt: true,
            lastLoginAt: true,
        },
    });
    if (!user) notFound();
    return user;
}
