export type AccountDetailData = {
    id: number;
    code: string;
    name: string | null;
    balance: string;
    openedAt: string | null;
    installmentFactor: number;
    _count: { loans: number; installments: number };
    loans: {
        id: number;
        amount: string;
        status: string;
    }[];
    kpis: {
        unpaidInstallments: number;
    };
    activities: {
        id: string;
        at: string;
        type: string;
        amount: string;
        href: string;
    }[];
};
