import PagePaper from "@dashboard/components/paper/PagePaper";
import { Title } from "@mantine/core";
import UserForm from "./components/UserForm";

const AddUser = () => {
  return (
    <PagePaper>
      <Title order={4}>Add new User!</Title>
      <UserForm />
    </PagePaper>
  );
};

export default AddUser;
