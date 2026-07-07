export type LoanDetailData = {
    id: number;
    description: string | null;
    amount: string;
    status: string;
    paymentCount: number;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    account: {
        id: number;
        code: string;
        name: string | null;
    };
    payments: {
        id: number;
        amount: string;
        dueDate: string;
        paidAt: string | null;
    }[];
    stats: {
        paidCount: number;
        unpaidCount: number;
        overdueCount: number;
        paidAmount: string;
        unpaidAmount: string;
        overdueAmount: string;
        remainingAmount: string;
        progressPercent: number;
    };
    charts: {
        statusBreakdown: {
            paid: number;
            unpaid: number;
            overdue: number;
        };
    };
    timeline: {
        id: string;
        type: string;
        at: string;
        amount: string;
        href: string;
    }[];
};
