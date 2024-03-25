import RichSelectBox, { richSelectBoxDataResolver } from "@dashboard/components/select/RichSelectBox";
import { IRichSelectData } from "@dashboard/components/select/interface";
import { searchUserForSelectBox } from "@database/user/data";
import { ComboboxItem, TextInputProps } from "@mantine/core";
import { forwardRef, useEffect, useState } from "react";

type Props = TextInputProps & {
    onChange?: ((value: string | null, option: ComboboxItem) => void) | undefined
}

const SearchAndSelectUser = forwardRef<HTMLInputElement, Props>(({ name, error, onChange }, ref) => {
    const [users, setUsers] = useState<IRichSelectData[]>([]);

    useEffect(() => {
        // get 10 result for the first time
        const initialUsers = async () => {
            const result = await searchUserForSelectBox(null, 10);
            setUsers(richSelectBoxDataResolver(JSON.parse(result as any), 'fullName'));
        }
        initialUsers();
    }, []);

    const handleSearch = async (search: string) => {
        const result = await searchUserForSelectBox(search);
        setUsers(richSelectBoxDataResolver(JSON.parse(result as any), 'fullName'));
    }

    return (<RichSelectBox
        placeholder="Search for a user"
        withAsterisk
        label="User"
        data={users}
        handleSearch={handleSearch}
        ref={ref}
        name={name}
        error={error}
        onChange={onChange}
    />)
});


export default SearchAndSelectUser;