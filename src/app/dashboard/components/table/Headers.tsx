import { Table } from "@mantine/core";
import { FC, memo } from "react";
import Sortable from "./Sortable";
import { IRichTableHeadersProps } from "./interface";

const Headers: FC<IRichTableHeadersProps> = ({ headers, sort, handleSort }) => {
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

export default memo(Headers);