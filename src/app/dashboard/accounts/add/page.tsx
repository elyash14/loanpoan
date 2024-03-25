import PagePaper from "@dashboard/components/paper/PagePaper";
import { Title } from "@mantine/core";
import AddAccountForm from "./components/AddAccountForm";

const AddAccount = () => {
    return (
        <PagePaper>
            <Title order={4}>Add New Account</Title>
            <AddAccountForm />
        </PagePaper>
    );
};

export default AddAccount;