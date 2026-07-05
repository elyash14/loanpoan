import { Table } from "@mantine/core";
import { memo } from "react";
import Sortable from "./Sortable";
import { IRichTableHeadersProps, IRichTableRow } from "./interface";

const Headers = <TRow extends IRichTableRow>({ headers, sort, handleSort }: IRichTableHeadersProps<TRow>) => {
    return <>{headers.map((header, key) => {
        return (
            <Table.Th key={`${key}-${header.name}`}>
                {header.sortable && (
                    <Sortable
                        columnName={header.name}
                        sort={sort!}
                        handleSort={handleSort!}
                    />
                )}
                {header.label ?? header.name}
            </Table.Th>
        );
    })}
    </>
}

export default memo(Headers) as typeof Headers;
