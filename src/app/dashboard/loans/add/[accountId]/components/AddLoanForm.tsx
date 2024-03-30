"use client";
import { createLoan } from "@database/loan/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Container, Group, NumberFormatter, NumberInput, TextInput, Textarea, rem } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Account } from "@prisma/client";
import { IconCalendar, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { successNotification } from "utils/Notification/notification";
import { DASHBOARD_URL } from "utils/configs";
import { CreateLoanFormSchemaInputType, createLoanValidationSchema } from "utils/form-validations/loan/createLoanValidation";
import { GlobalConfigType } from "utils/types/configs";
import PaymentsShowModal from "./PaymentsShowModal";

type Props = {
    data: string
    dateType: GlobalConfigType["dateType"]
    currency: GlobalConfigType["currency"]
    loanConfig: GlobalConfigType["loan"]
}
function AddLoanForm({ data, dateType, currency, loanConfig }: Props) {
    const account: Account = useMemo(() => JSON.parse(data), [data]);
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);
    const mustCalculate = useRef<boolean>(true)

    const minimumAmount = loanConfig?.minimumFactor! * Number(account.balance);
    const maximumValue = loanConfig?.maximumFactor! * Number(account.balance);

    const {
        watch, setError, control, register, setValue,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateLoanFormSchemaInputType>({
        resolver: zodResolver(createLoanValidationSchema, {}, { raw: true }),
        defaultValues: {
            paymentCount: 12,
            amount: maximumValue,
            accountId: account.id,
        }
    });

    const onSubmit: SubmitHandler<CreateLoanFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }

        // send it to the server with server actions
        const result = await createLoan(formData);
        if (result.status === 'ERROR') {
            for (const e in result.error!) {
                setError(e as any, { message: String(result.error?.[e as ("amount" | "accountId" | "description" | "paymentCount" | "startedAt")]) });
            }
        }
        else if (result.status === 'SUCCESS') {
            successNotification({
                title: 'Success',
                message: result.message!,
            });
            router.push(`/${DASHBOARD_URL}/loans`);
        }
    };
    const amount = watch("amount");
    const paymentCount = watch("paymentCount");
    const startedAt = watch("startedAt");

    const handleOpenModal = useDebouncedCallback(() => { setOpenModal(true) }, 1000);

    useEffect(() => {
        if (mustCalculate.current === true && amount && paymentCount && startedAt) {
            handleOpenModal();
        }
        mustCalculate.current = true;
    }, [amount, paymentCount, startedAt]);

    return (
        <Container size="sm" >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    control={control}
                    name="paymentAmount"
                    render={({ field: { value } }) => (
                        <input
                            type="hidden"
                            value={value}
                        />
                    )}
                />
                <input type="hidden" name="accountId" value={account.id} />
                <TextInput
                    readOnly
                    label="Account Info"
                    value={(account as any).user.fullName + ' - ' + account.code}
                />
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <NumberInput
                            withAsterisk
                            label="Total Amount"
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            thousandSeparator=","
                            allowNegative={false}
                            error={errors.amount?.message}
                            min={loanConfig?.restrict ? minimumAmount : undefined}
                            max={loanConfig?.restrict ? maximumValue : undefined}
                            description={<>
                                Minimum and maximum amount for this account:
                                <NumberFormatter thousandSeparator value={minimumAmount} />&nbsp;:&nbsp;
                                <NumberFormatter thousandSeparator value={maximumValue} />
                            </>}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="paymentCount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <NumberInput
                            withAsterisk
                            label="Payment Count"
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            allowNegative={false}
                            error={errors.paymentCount?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="startedAt"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <DatePickerInput
                            leftSection={<IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
                            withAsterisk
                            label="Start Date"
                            placeholder="Pick a date"
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )} />
                <Textarea
                    label="Description"
                    {...register('description')}
                    error={errors.description?.message}
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
            {openModal && <PaymentsShowModal
                totalAmount={amount}
                paymentCount={paymentCount}
                startedAt={startedAt}
                dateType={dateType}
                currency={currency}
                handleClose={(paymentAmount, paymentCount) => {
                    setValue('paymentAmount', paymentAmount);
                    setValue('paymentCount', paymentCount);
                    mustCalculate.current = false; //prevent recalculate payments
                    setOpenModal(false);
                }}
            />}
        </Container>
    );
}

export default AddLoanForm;