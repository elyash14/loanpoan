'use client'

import { saveInstallmentConfig } from "@database/config/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, NumberInput, rem } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { SaveInstallmentConfigFormSchemaInputType, saveInstallmentConfigSchema } from "utils/form-validations/config/saveInstallmentConfig";
import { globalConfigAtom } from "utils/stores/configs";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    installment: GlobalConfigType['installment'],
}

const InstallmentDates = ({ installment }: Props) => {
    const setGlobalConfig = useSetAtom(globalConfigAtom);
    const {
        control,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SaveInstallmentConfigFormSchemaInputType>({
        resolver: zodResolver(saveInstallmentConfigSchema, {}, { raw: true }),
        defaultValues: {
            dueDay: installment!.dueDay,
            payDay: installment!.payDay,
        }
    });

    const onSubmit: SubmitHandler<SaveInstallmentConfigFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }
        // send it to the server with server actions
        const result = await saveInstallmentConfig(formData);
        if (result.status === 'ERROR') {
            if (result.error) {
                for (const e in result.error!) {
                    setError(e as any, { message: String(result.error?.[e as ("dueDay")]) });
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
            setGlobalConfig(result.data!);
        }
    };

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
            control={control}
            name="dueDay"
            render={({ field: { onChange, onBlur, value } }) => (
                <NumberInput
                    withAsterisk
                    label="Installment Due Day"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    allowNegative={false}
                    error={errors.dueDay?.message}
                    min={1}
                    max={29}
                    description={<>
                        The day of each month that all installments will be generate
                    </>}
                />
            )}
        />

        <Controller
            control={control}
            name="payDay"
            render={({ field: { onChange, onBlur, value } }) => (
                <NumberInput
                    withAsterisk
                    label="Installment Pay Day"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    allowNegative={false}
                    error={errors.payDay?.message}
                    min={2}
                    max={29}
                    description={<>
                        The day of each month that all installments will be payed
                    </>}
                />
            )}
        />

        <Group mt="md" mb="xl">
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

export default InstallmentDates