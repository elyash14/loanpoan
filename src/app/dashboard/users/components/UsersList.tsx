'use client';

import RichTable from "@dashboard/components/table/RichTable";
import { IRichTableSort } from "@dashboard/components/table/interface";
import { useState } from "react";

const elements = [
    { id: 6, name: 'Carbon', symbol: 'C', mass: 12.011, },
    { id: 7, name: 'Nitrogen', symbol: 'N', mass: 14.007, },
    { id: 39, name: 'Yttrium', symbol: 'Y', mass: 88.906, },
    { id: 56, name: 'Barium', symbol: 'Ba', mass: 137.33, },
    { id: 58, name: 'Cerium', symbol: 'Ce', mass: 140.12, },
];

const data = {
    headers: [
        { name: "id", sortable: true },
        { name: "Element name", sortable: true },
        { name: "Symbol" },
        { name: "Atomic mass" },
    ],
    rows: elements,
}

const UsersList = () => {
    const [sort, setSort] = useState<IRichTableSort>({ column: "id", dir: "desc" })
    const handleSort = (sortable: IRichTableSort) => {
        setSort(sortable);
    }

    return <RichTable
        data={data}
        hasRowSelector
        sort={sort}
        handleSort={handleSort}
    />
}

export default UsersList;