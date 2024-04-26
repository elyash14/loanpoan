import { Title } from "@mantine/core";
import { usePathname } from "next/navigation";

const pages: any = {
    "profile": "My Profile",
    "home": "Home",
    "accounts": "My Accounts",
    "installments": "Installments",
    "loans": "My Loans",
};
const Header = () => {
    const pathname = usePathname().split("/");
    console.log('pathname', pathname);

    return <Title order={4}>{pages[pathname[1]]}</Title>
}

export default Header;