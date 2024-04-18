"use client";
import { updateUser } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Container,
  Group,
  Select,
  TextInput,
  rem,
} from "@mantine/core";
import { User } from "@prisma/client";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { successNotification } from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import {
  EditUserFormSchemaInputType,
  editUserValidationSchema,
} from "utils/form-validations/user/editUserValidation";

type Props = {
  data: string;
};
function EditUserForm({ data }: Props) {
  const user: User = useMemo(() => JSON.parse(data), [data]);
  const router = useRouter();

  const {
    setError,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormSchemaInputType>({
    resolver: zodResolver(editUserValidationSchema, {}, { raw: true }),
    values: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
    },
  });

  const sex = [
    { value: "WOMAN", label: "Woman" },
    { value: "MAN", label: "Man" },
  ];

  const onSubmit: SubmitHandler<EditUserFormSchemaInputType> = async (data) => {
    // create a form data
    const formData = new FormData();
    for (const field of Object.keys(data) as Array<keyof typeof data>) {
      formData.append(`${field}`, `${data[field]}`);
    }

    // send it to the server with server actions
    const result = await updateUser(formData);
    if (result.status === "ERROR") {
      for (const e in result.error!) {
        setError(e as any, {
          message: String(
            result.error?.[
              e as "userId" | "email" | "firstName" | "lastName" | "gender"
            ],
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
        <input readOnly type="hidden" name="id" value={user.id} />
        <TextInput
          withAsterisk
          label="First Name"
          {...register("firstName")}
          error={errors.firstName?.message}
        />
        <TextInput
          label="Last Name"
          {...register("lastName")}
          error={errors.lastName?.message}
        />
        <TextInput
          withAsterisk
          label="Email"
          {...register("email")}
          error={errors.email?.message}
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
              data={sex}
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

export default EditUserForm;
