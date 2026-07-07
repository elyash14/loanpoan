"use server";

import prisma from "@database/prisma";
import { getUserRelatedData } from "@database/user/data";
import { paginatedLoanList } from "@database/loan/data";
import { paginatedInstallmentsList } from "@database/installments/data";
import { paginatedPaymentsList } from "@database/payment/data";
import { RichTableSortDir } from "@dashboard/components/table/interface";
import { notFound } from "next/navigation";

function decimalToString(value: { toString(): string } | null | undefined): string {
    return value?.toString() ?? "0";
}

export async function getUserPanelOverview(userId: number) {
    const related = await getUserRelatedData(userId);
    const stats = await getUserPanelStats(userId);
    return { related, stats };
}

export async function getUserPanelStats(userId: number) {
    const now = new Date();
    const accountWhere = { userId };
    const overdueUnpaid = { paidAt: null, dueDate: { lt: now } };

    const [
        loansTotal,
        paymentsTotal,
        installmentsTotal,
        overdueLoansTotal,
        overduePaymentsTotal,
        overdueInstallmentsTotal,
        balanceSum,
    ] = await Promise.all([
        prisma.loan.aggregate({
            _sum: { amount: true },
            where: { account: accountWhere },
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { loan: { account: accountWhere } },
        }),
        prisma.installment.aggregate({
            _sum: { amount: true },
            where: { account: accountWhere },
        }),
        prisma.loan.aggregate({
            _sum: { amount: true },
            where: {
                status: "IN_PROGRESS",
                account: accountWhere,
                payments: { some: overdueUnpaid },
            },
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { ...overdueUnpaid, loan: { account: accountWhere } },
        }),
        prisma.installment.aggregate({
            _sum: { amount: true },
            where: { ...overdueUnpaid, account: accountWhere },
        }),
        prisma.account.aggregate({
            _sum: { balance: true },
            where: { userId, deletedAt: null },
        }),
    ]);

    return {
        totalBalance: decimalToString(balanceSum._sum.balance),
        totals: {
            loans: decimalToString(loansTotal._sum.amount),
            payments: decimalToString(paymentsTotal._sum.amount),
            installments: decimalToString(installmentsTotal._sum.amount),
        },
        overdue: {
            loans: decimalToString(overdueLoansTotal._sum.amount),
            payments: decimalToString(overduePaymentsTotal._sum.amount),
            installments: decimalToString(overdueInstallmentsTotal._sum.amount),
        },
    };
}

export async function getSystemAbstractStats() {
    const [userCount, accountCount, loanCount, installmentAmount] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null, role: "USER" } }),
        prisma.account.count({ where: { deletedAt: null } }),
        prisma.loan.count(),
        prisma.installmentAmount.findFirst({
            where: { deprecatedAt: null },
            orderBy: { createdAt: "desc" },
            select: { amount: true },
        }),
    ]);

    return {
        userCount,
        accountCount,
        loanCount,
        currentInstallmentAmount: decimalToString(installmentAmount?.amount),
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
                href: `/installments?account=${accountId}`,
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
                href: row.loanId ? `/payments?loan=${row.loanId}` : "/payments",
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
    const unpaidPayments = payments.filter((row) => !row.paidAt);
    const overduePayments = payments.filter((row) => !row.paidAt && row.dueDate < now);

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
                href: `/payments?loan=${loan.id}`,
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
                unpaid: unpaidPayments.length,
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

export async function paginatedUserPayments(
    userId: number,
    page: number,
    limit: number,
    status: string,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
) {
    return paginatedPaymentsList(page, limit, status, undefined, search, sortBy, sortDir, userId);
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
            createdAt: true,
        },
    });
    if (!user) notFound();
    return user;
}
