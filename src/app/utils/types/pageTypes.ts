import { RichTableSortDir } from "@dashboard/components/table/interface";

export type PageSearchParams = {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
    account?: string;
    user?: string;
    loanId?: string;
    loan?: string;
    status?: string;
    from?: string;
    fromAccount?: string;
    fromLoan?: string;
};

export type ListPage = {
    searchParams: Promise<PageSearchParams>;
};

export type InstancePage = ListPage & {
    params: Promise<{
        id: string;
    }>;
};

export type AccountIdPage = ListPage & {
    params: Promise<{
        accountId: string;
    }>;
};
