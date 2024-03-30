'use client'

import { saveLoanConfig } from "@database/config/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, NumberInput, Switch, rem } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { SaveLoanConfigFormSchemaInputType, saveLoanConfigSchema } from "utils/form-validations/config/saveLoanConfig";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    loanConfig: GlobalConfigType['loan'],
}

const LoanConfig = ({ loanConfig }: Props) => {
    const {
        watch,
        control,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SaveLoanConfigFormSchemaInputType>({
        resolver: zodResolver(saveLoanConfigSchema, {}, { raw: true }),
        values: {
            minimumFactor: loanConfig?.minimumFactor ?? 1,
            maximumFactor: loanConfig?.maximumFactor ?? 2,
            restrict: loanConfig?.restrict ?? false,
        }
    });

    const onSubmit: SubmitHandler<SaveLoanConfigFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();

        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            if (field === 'restrict') {
                formData.append(`${field}`, data['restrict'] === true ? '1' : '');
                continue;
            }
            formData.append(`${field}`, `${data[field]}`);
        }
        // send it to the server with server actions
        const result = await saveLoanConfig(formData);
        if (result.status === 'ERROR') {
            if (result.error) {
                for (const e in result.error!) {
                    setError(e as any, { message: String(result.error?.[e as ("minimumFactor")]) });
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
        }
    };

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
            control={control}
            name="minimumFactor"
            render={({ field: { onChange, onBlur, value } }) => (
                <NumberInput
                    withAsterisk
                    label="Minimum Factor"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    allowNegative={false}
                    error={errors.minimumFactor?.message}
                    description={"The minimum value that will be multiplied account balance"}
                />
            )}
        />

        <Controller
            control={control}
            name="maximumFactor"
            render={({ field: { onChange, onBlur, value } }) => (
                <NumberInput
                    withAsterisk
                    label="maximum Factor"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    allowNegative={false}
                    error={errors.maximumFactor?.message}
                    description={"The maximum value that will be multiplied account balance"}
                />
            )}
        />

        <Controller
            control={control}
            name="restrict"
            render={({ field: { onChange, onBlur, value } }) => (
                <Switch
                    mt={rem(25)}
                    label="Restrict Mode"
                    description="If this is checked you can not create a loan with a custom value less than the minimum and gather than the maximum factor"
                    checked={Boolean(value)}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={errors.restrict?.message}
                />
            )}
        />

        <Group mt="lg">
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

export default LoanConfig;