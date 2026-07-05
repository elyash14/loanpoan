"use server";

import prisma from "@database/prisma";

export type DashboardStats = {
    totals: {
        loans: string;
        payments: string;
        installments: string;
    };
    overdue: {
        loans: string;
        payments: string;
        installments: string;
    };
    collection: {
        paymentsPaid: string;
        paymentsTotal: string;
        installmentsPaid: string;
        installmentsTotal: string;
    };
};

function decimalToString(
    value: { toString(): string } | null | undefined,
): string {
    return value?.toString() ?? "0";
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const overdueUnpaid = { paidAt: null, dueDate: { lt: now } };

    const [
        loansTotal,
        paymentsTotal,
        installmentsTotal,
        overdueLoansTotal,
        overduePaymentsTotal,
        overdueInstallmentsTotal,
        paymentsPaid,
        installmentsPaid,
    ] = await Promise.all([
        prisma.loan.aggregate({ _sum: { amount: true } }),
        prisma.payment.aggregate({ _sum: { amount: true } }),
        prisma.installment.aggregate({ _sum: { amount: true } }),
        prisma.loan.aggregate({
            _sum: { amount: true },
            where: {
                status: "IN_PROGRESS",
                payments: { some: overdueUnpaid },
            },
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: overdueUnpaid,
        }),
        prisma.installment.aggregate({
            _sum: { amount: true },
            where: overdueUnpaid,
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { paidAt: { not: null } },
        }),
        prisma.installment.aggregate({
            _sum: { amount: true },
            where: { paidAt: { not: null } },
        }),
    ]);

    return {
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
        collection: {
            paymentsPaid: decimalToString(paymentsPaid._sum.amount),
            paymentsTotal: decimalToString(paymentsTotal._sum.amount),
            installmentsPaid: decimalToString(installmentsPaid._sum.amount),
            installmentsTotal: decimalToString(installmentsTotal._sum.amount),
        },
    };
}
