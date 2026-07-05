import { RichTableSortDir } from "@dashboard/components/table/interface";

export type PageSearchParams = {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDir?: RichTableSortDir;
    account?: string;
    loanId?: string;
    status?: string;
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
