'use client'

import { saveCurrencyConfig } from "@database/config/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, TextInput, rem } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { SaveCurrencyFormSchemaInputType, saveCurrencySchema } from "utils/form-validations/config/saveCurrencyConfig";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    currency: GlobalConfigType["currency"]
}

const CurrencyConfig = ({ currency }: Props) => {
    const {
        setError,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SaveCurrencyFormSchemaInputType>({
        resolver: zodResolver(saveCurrencySchema, {}, { raw: true }),
        defaultValues: currency ? { name: currency.name, symbol: currency.symbol } : { name: '', symbol: '' }
    });

    const onSubmit: SubmitHandler<SaveCurrencyFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }
        // send it to the server with server actions
        const result = await saveCurrencyConfig(formData);
        if (result.status === 'ERROR') {
            if (result.error) {
                for (const e in result.error!) {
                    setError(e as any, { message: String(result.error?.[e as ("name" | "symbol")]) });
                }
            } else {
                errorNotification({
                    title: 'Error',
                    message: result.message!,
                });
            }
        }
        else if (result.status === 'SUCCESS') {
            successNotification({
                title: 'Success',
                message: result.message!,
            });
            close(); // close the modal after submit.
        }
    };

    return <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
            withAsterisk
            type="name"
            label="Currency Name"
            {...register('name')}
            error={errors.name?.message}
        />
        <TextInput
            withAsterisk
            type="symbol"
            label="Currency Symbol"
            {...register('symbol')}
            error={errors.symbol?.message}
        />
        <Group mt="md">
            <Button
                display="block"
                mb={rem(3)}
                leftSection={<IconDeviceFloppy size={14} />}
                type="submit"
                loading={isSubmitting}>
                Save
            </Button>
        </Group>
    </form>
}

export default CurrencyConfig;