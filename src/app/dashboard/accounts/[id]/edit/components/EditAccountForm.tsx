"use client";
import { updateAccount } from "@database/account/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Container,
  Group,
  NumberInput,
  TextInput,
  rem,
} from "@mantine/core";
import { Account } from "@prisma/client";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { successNotification } from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import {
  EditAccountFormSchemaInputType,
  editAccountValidationSchema,
} from "utils/form-validations/account/editAccountValidation";

type Props = {
  data: string;
};
function EditAccountForm({ data }: Props) {
  const account: Account = useMemo(() => JSON.parse(data), [data]);
  const router = useRouter();
  console.log(account);

  const {
    setError,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAccountFormSchemaInputType>({
    resolver: zodResolver(editAccountValidationSchema, {}, { raw: true }),
    values: {
      id: account.id,
      code: account.code,
      name: account.name,
      installmentFactor: account.installmentFactor,
    },
  });

  const onSubmit: SubmitHandler<EditAccountFormSchemaInputType> = async (
    data,
  ) => {
    // create a form data
    const formData = new FormData();
    for (const field of Object.keys(data) as Array<keyof typeof data>) {
      formData.append(`${field}`, `${data[field]}`);
    }

    // send it to the server with server actions
    const result = await updateAccount(formData);
    if (result.status === "ERROR") {
      for (const e in result.error!) {
        setError(e as any, {
          message: String(
            result.error?.[
              e as "code" | "userId" | "name" | "installmentFactor"
            ],
          ),
        });
      }
    } else if (result.status === "SUCCESS") {
      successNotification({
        title: "Success",
        message: result.message!,
      });
      router.push(`/${DASHBOARD_URL}/accounts`);
    }
  };

  return (
    <Container size="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input readOnly type="hidden" name="id" />
        <TextInput
          readOnly
          label="User"
          value={(account as any).user.fullName}
        />
        <TextInput
          withAsterisk
          label="Code"
          {...register("code")}
          error={errors.code?.message}
        />
        <TextInput
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />
        <Controller
          control={control}
          name="installmentFactor"
          render={({ field: { onChange, onBlur, value } }) => (
            <NumberInput
              withAsterisk
              label="Installment Factor"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              allowNegative={false}
              error={errors.installmentFactor?.message}
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

export default EditAccountForm;
