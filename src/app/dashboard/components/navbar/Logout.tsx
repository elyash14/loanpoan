import { logout } from "@database/user/actions";
import { ActionIcon } from "@mantine/core";
import { IconPower } from "@tabler/icons-react";

const Logout = () => {
    return <form action={logout}>
        <ActionIcon variant="transparent"
            type="submit"
            size="xl" aria-label="logout">
            <IconPower stroke={1.5} />
        </ActionIcon>
    </form>
}

export default Logout;