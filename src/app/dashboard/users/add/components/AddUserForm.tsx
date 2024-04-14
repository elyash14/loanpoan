"use client";
import { createUser } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Container,
  Group,
  PasswordInput,
  Select,
  TextInput,
  rem,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { successNotification } from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import {
  CreateUserFormSchemaInputType,
  createUserValidationSchema,
} from "utils/form-validations/user/createUserValidation";
// import SearchAndSelectUser from "./SearchAndSelectUser";

function AddAccountForm() {
  const router = useRouter();

  const {
    control,
    setError,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormSchemaInputType>({
    resolver: zodResolver(createUserValidationSchema, {}, { raw: true }),
  });

  const data = [
    { value: "WOMAN", label: "Woman" },
    { value: "MAN", label: "Man" },
  ];

  const onSubmit: SubmitHandler<CreateUserFormSchemaInputType> = async (
    data,
  ) => {
    // create a form data
    const formData = new FormData();
    for (const field of Object.keys(data) as Array<keyof typeof data>) {
      formData.append(`${field}`, `${data[field]}`);
    }

    // send it to the server with server actions
    const result = await createUser(formData);
    if (result.status === "ERROR") {
      for (const e in result.error!) {
        //TODO I cant figure the type of this line of code!!!!
        setError(e as any, {
          message: String(
            result.error?.[e as "email" | "firstName" | "lastName" | "gender"],
          ),
        });
      }
    } else if (result.status === "SUCCESS") {
      successNotification({
        title: "Success",
        message: result.message!,
      });
      router.push(`/${DASHBOARD_URL}/users`);
    }
  };

  return (
    <Container size="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <SearchAndSelectUser
          {...register("userId")}
          error={errors.userId?.message}
          onChange={(v) => setValue("userId", Number(v))}
        /> */}
        <TextInput
          withAsterisk
          label="Email"
          {...register("email")}
          error={errors.email?.message}
        />
        <TextInput
          label="First Name"
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <TextInput
          label="Last Name"
          {...register("lastName")}
          error={errors.lastName?.message}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              placeholder="Password"
              label="Password"
              description="Password must include at least one letter, number and special character"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              withAsterisk
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, onBlur, value } }) => (
            <Select
              label="Enter Your Gender"
              placeholder="Pick one"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              data={data}
              error={errors.gender?.message}
            />
          )}
        />

        <Group mt="md">
          <Button
            display="block"
            mb={rem(3)}
            leftSection={<IconDeviceFloppy size={14} />}
            type="submit"
            loading={isSubmitting}
          >
            Save
          </Button>
        </Group>
      </form>
    </Container>
  );
}

export default AddAccountForm;
