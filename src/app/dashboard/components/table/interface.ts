export interface IRichTableRow {
    id: number;
    [key: string]: any;
}

export interface IRichTableSort {
    column: string,
    dir: RichTableSortDir,
}

export interface IRichTableHeader {
    name: string;
    sortable?: boolean;
}

export interface IRichTableProps {
    data: {
        headers: IRichTableHeader[],
        rows: IRichTableRow[]
    };
    hasRowSelector?: boolean;
    sort?: IRichTableSort;
    handleSort?: (sort: IRichTableSort) => void;
}

export type RichTableSortDir = 'asc' | 'desc' | undefined;