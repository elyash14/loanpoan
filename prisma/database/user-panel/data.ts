"use server";

import prisma from "@database/prisma";
import { getUserRelatedData } from "@database/user/data";
import { paginatedAccountList } from "@database/account/data";
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
    const account = await prisma.account.findFirst({
        where: { id: accountId, userId },
        include: {
            loans: {
                where: { status: "IN_PROGRESS" },
                take: 1,
            },
            _count: { select: { loans: true, installments: true } },
        },
    });
    if (!account) notFound();
    return account;
}

export async function getUserLoanIfOwned(userId: number, loanId: number) {
    const loan = await prisma.loan.findFirst({
        where: { id: loanId, account: { userId } },
        include: {
            account: { select: { id: true, code: true } },
            _count: {
                select: {
                    payments: { where: { paidAt: { not: null } } },
                },
            },
            payments: {
                where: { paidAt: null },
                orderBy: { dueDate: "asc" },
                take: 1,
            },
        },
    });
    if (!loan) notFound();
    return loan;
}

export async function paginatedUserAccounts(
    userId: number,
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDir?: RichTableSortDir,
) {
    return paginatedAccountList(page, limit, search, sortBy, sortDir, userId);
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
