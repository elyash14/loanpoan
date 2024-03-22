import { RichTableSortDir } from "@dashboard/components/table/interface";

export type ListPage = {
    searchParams: {
        search?: string;
        page?: string;
        limit?: string;
        sortBy?: string;
        sortDir?: RichTableSortDir
    }
}

export type InstancePage = ListPage & {
    params: {
        id: string;
    }
}