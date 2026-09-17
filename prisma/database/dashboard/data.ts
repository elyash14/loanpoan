"use server";

import prisma from "@database/prisma";
import Decimal from "decimal.js";

export type DashboardUnpaidPayment = {
    id: number;
    amount: string;
    dueDate: string;
    loanId: number | null;
    isOverdue: boolean;
    loan: {
        id: number;
        account: {
            id: number;
            code: string;
            user: {
                id: number;
                fullName: string;
            };
        };
    } | null;
};

export type DashboardStats = {
    fundBalance: string;
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
    unpaidPayments: DashboardUnpaidPayment[];
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
        activeInstallmentsPaid,
        unpaidPaymentsTotal,
        unpaidPaymentsList,
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
        prisma.installment.aggregate({
            _sum: { amount: true },
            where: {
                paidAt: { not: null },
                account: { deletedAt: null },
            },
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { paidAt: null },
        }),
        prisma.payment.findMany({
            where: { paidAt: null },
            include: {
                loan: {
                    include: {
                        account: {
                            include: {
                                user: {
                                    select: { id: true, fullName: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        }),
    ]);

    const paidActiveInstallmentsDecimal = new Decimal(activeInstallmentsPaid._sum.amount?.toString() ?? "0");
    const unpaidPaymentsDecimal = new Decimal(unpaidPaymentsTotal._sum.amount?.toString() ?? "0");
    const fundBalance = paidActiveInstallmentsDecimal.minus(unpaidPaymentsDecimal).toString();

    const unpaidPayments: DashboardUnpaidPayment[] = unpaidPaymentsList.map((p) => ({
        id: p.id,
        amount: p.amount.toString(),
        dueDate: p.dueDate.toISOString(),
        loanId: p.loanId,
        isOverdue: p.dueDate < now,
        loan: p.loan
            ? {
                  id: p.loan.id,
                  account: {
                      id: p.loan.account?.id ?? 0,
                      code: p.loan.account?.code ?? "",
                      user: {
                          id: p.loan.account?.user?.id ?? 0,
                          fullName: p.loan.account?.user?.fullName ?? "",
                      },
                  },
              }
            : null,
    }));

    return {
        fundBalance,
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
        unpaidPayments,
    };
}
