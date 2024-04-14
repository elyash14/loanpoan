"use client";
import { updatePassword } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Container, Group, PasswordInput, rem } from "@mantine/core";
import { User } from "@prisma/client";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  errorNotification,
  successNotification,
} from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import {
  ChangePasswordFormSchemaOutputType,
  changePasswordValidationSchema,
} from "utils/form-validations/user/changePasswordValidation";

type Props = {
  data: string;
};
function ChangePasswordForm({ data }: Props) {
  const user: User = useMemo(() => JSON.parse(data), [data]);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormSchemaOutputType>({
    resolver: zodResolver(changePasswordValidationSchema, {}, { raw: true }),
    values: {
      id: user.id,
      password: "",
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormSchemaOutputType> = async (
    data,
  ) => {
    // create a form data
    const formData = new FormData();
    for (const field of Object.keys(data) as Array<keyof typeof data>) {
      formData.append(`${field}`, `${data[field]}`);
    }

    // send it to the server with server actions
    const result = await updatePassword(formData);
    if (result.status === "ERROR") {
      errorNotification({
        title: "Success",
        message: result.message!,
      });
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
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              placeholder="Password"
              label="New Password"
              description="Password must include at least one letter, number and special character"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              withAsterisk
              error={errors.password?.message}
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

export default ChangePasswordForm;
