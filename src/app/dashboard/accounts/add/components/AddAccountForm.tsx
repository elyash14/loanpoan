"use client";
import { createAccount } from "@database/account/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Container,
    Group,
    NumberInput,
    TextInput,
    rem,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    errorNotification,
    successNotification,
} from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import {
    CreateAccountFormSchemaInputType,
    createAccountValidationSchema,
} from "utils/form-validations/account/createAccountValidation";
import SearchAndSelectUser from "./SearchAndSelectUser";

function AddAccountForm() {
    const router = useRouter();

    const {
        control,
        setError,
        setValue,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateAccountFormSchemaInputType>({
        resolver: zodResolver(createAccountValidationSchema, {}, { raw: true }),
        defaultValues: {
            installmentFactor: 1,
        },
        // values , it will be useful for the update page
    });

    const onSubmit: SubmitHandler<CreateAccountFormSchemaInputType> = async (
        data,
    ) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }

        // send it to the server with server actions
        const result = await createAccount(formData);
        if (result.status === "ERROR") {
            for (const e in result.error!) {
                //TODO I cant figure the type of this line of code!!!!
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
            return;
        }
        errorNotification({
            title: "Error",
            message: result.message!,
        });
    };

    return (
        <Container size="sm">
            <form onSubmit={handleSubmit(onSubmit)}>
                <SearchAndSelectUser
                    {...register("userId")}
                    error={errors.userId?.message}
                    onChange={(v) => setValue("userId", Number(v))}
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

export default AddAccountForm;
