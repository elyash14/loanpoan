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
  telegramMembers: string;
};
function EditUserForm({ data, telegramMembers }: Props) {
  const user: User = useMemo(() => JSON.parse(data), [data]);
  const memberOptions = useMemo(
    () => JSON.parse(telegramMembers) as { value: string; label: string; username: string; disabled?: boolean }[],
    [telegramMembers],
  );
  const router = useRouter();

  const {
    setError,
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormSchemaInputType>({
    resolver: zodResolver(editUserValidationSchema, {}, { raw: true }),
    values: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      telegramId: user.telegramId?.toString() ?? "",
      telegramUsername: user.telegramUsername ?? "",
    },
  });

  const linkedTelegramId = watch("telegramId");

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
        <input type="hidden" {...register("id", { valueAsNumber: true })} />
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
        <Select
          label="Link Telegram member"
          placeholder={memberOptions.length ? "Pick from synced group members" : "No members synced yet — go to Telegram tab"}
          description="Sync members on Dashboard → Telegram, or enter ID manually below"
          searchable
          clearable
          value={linkedTelegramId || null}
          onChange={(selected) => {
            setValue("telegramId", selected ?? "");
            const picked = memberOptions.find((m) => m.value === selected);
            setValue("telegramUsername", picked?.username ?? "");
          }}
          data={memberOptions.map((m) => ({
            value: m.value,
            label: m.label,
            disabled: m.disabled,
          }))}
        />
        <TextInput
          label="Telegram ID (manual)"
          placeholder="Numeric Telegram user ID"
          description="User must open the Mini App after linking"
          {...register("telegramId")}
          error={errors.telegramId?.message}
        />
        <TextInput
          label="Telegram username"
          placeholder="@username (optional)"
          {...register("telegramUsername")}
          error={errors.telegramUsername?.message}
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
