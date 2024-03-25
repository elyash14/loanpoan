import { Select } from "@mantine/core";
import { forwardRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { IRichSelectBoxProps } from "./interface";

const RichSelectBox = forwardRef<HTMLInputElement, IRichSelectBoxProps>(({ data, handleSearch, ...rest }, ref) => {
    const [currentLabel, setCurrentLabel] = useState<string | null>(null);

    const handleSearchChange = useDebouncedCallback(async (value: string) => {
        // prevent making request if value is not changed
        if (value !== currentLabel && value.length > 2) {
            handleSearch(value)
        }
    }, 500);

    return <Select
        ref={ref}
        {...rest}
        data={data}
        searchable
        nothingFoundMessage="Nothing found..."
        onSearchChange={(v) => handleSearchChange(v)}
        onChange={(_value, option) => {
            setCurrentLabel(option.label);
            if (rest.onChange) {
                rest.onChange(_value, option);
            }
        }}
    />
});

export const richSelectBoxDataResolver = (data: any[], label: string, value: string = 'id') => {
    return data.map(item => ({ value: String(item[value]), label: item[label] }))
}

RichSelectBox.displayName = 'RichSelectBox';

export default RichSelectBox;