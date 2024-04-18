import PagePaper from "@dashboard/components/paper/PagePaper";
import { Title } from "@mantine/core";
import AddUserForm from "./components/AddUserForm";

const AddAccount = () => {
  return (
    <PagePaper>
      <Title order={4}>Add New User</Title>
      <AddUserForm />
    </PagePaper>
  );
};

export default AddAccount;
