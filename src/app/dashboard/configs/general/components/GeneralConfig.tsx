'use client'

import { saveGeneralConfig } from "@database/config/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Select, TextInput, rem } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { dateTypeOptions } from "utils/form-validations/config/defaultValues";
import { SaveGeneralConfigFormSchemaInputType, saveGeneralConfigSchema } from "utils/form-validations/config/saveGlobalConfig";
import { globalConfigAtom } from "utils/stores/configs";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    applicationName: GlobalConfigType['applicationName'],
    dateType: GlobalConfigType["dateType"]
}

const GeneralConfig = ({ applicationName, dateType }: Props) => {
    const setGlobalConfig = useSetAtom(globalConfigAtom);
    const {
        control,
        setError,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SaveGeneralConfigFormSchemaInputType>({
        resolver: zodResolver(saveGeneralConfigSchema, {}, { raw: true }),
        defaultValues: { applicationName, dateType }
    });

    const onSubmit: SubmitHandler<SaveGeneralConfigFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }
        // send it to the server with server actions
        const result = await saveGeneralConfig(formData);
        if (result.status === 'ERROR') {
            if (result.error) {
                for (const e in result.error!) {
                    setError(e as any, { message: String(result.error?.[e as ("applicationName")]) });
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
        <TextInput
            withAsterisk
            type="applicationName"
            label="Application Name"
            {...register('applicationName')}
            error={errors.applicationName?.message}
        />

        <Controller
            control={control}
            name="dateType"
            render={({ field: { onChange, onBlur, value } }) => (
                <Select
                    withAsterisk
                    label="Date Type"
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Select a date type"
                    data={dateTypeOptions}
                    value={value}
                />
            )}
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

export default GeneralConfig;