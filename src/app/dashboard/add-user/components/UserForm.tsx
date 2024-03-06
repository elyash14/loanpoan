"use client";
import { Box, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./UserForm.module.css";
import { validateForm } from "./validate";

export interface IFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  // gender: string;
  cartNumber: string;
  accountNumber: string;
}

function UserForm() {
  const form = useForm<IFormData>({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      // gender: "",
      cartNumber: "",
      accountNumber: "",
    },
    validate: validateForm,
  });

  return (
    <Box maw={340} mx="auto">
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <TextInput
          withAsterisk
          label="Email"
          {...form.getInputProps("email")}
        />

        <TextInput
          withAsterisk
          label="First Name"
          {...form.getInputProps("firstName")}
        />

        <TextInput
          withAsterisk
          label="Last Name"
          {...form.getInputProps("lastName")}
        />

        <TextInput
          withAsterisk
          label="Password"
          {...form.getInputProps("password")}
        />

        {/* <Select
          label="Gender"
          placeholder="Select your gender"
          data={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
          {...form.getInputProps("gender")}
        /> */}
        <TextInput label="cart-number" {...form.getInputProps("cartNumber")} />
        <TextInput
          label="account-number"
          {...form.getInputProps("accountNumber")}
        />

        <Group justify="flex-end" mt="md">
          <Button className={classes.submitButton} type="submit">
            Submit
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default UserForm;
