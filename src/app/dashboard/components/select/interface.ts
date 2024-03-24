import { SelectProps } from "@mantine/core";

export interface IRichSelectBoxProps extends SelectProps {
    handleSearch: (search: string) => Promise<void>,
}

export type IRichSelectData = {
    label: string;
    value: string;
}