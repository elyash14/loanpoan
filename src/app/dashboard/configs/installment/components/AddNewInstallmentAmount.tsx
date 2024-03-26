import { createInstallmentAmount } from "@database/installment-amount/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Group, Modal, TextInput, rem } from "@mantine/core";
import { IconDeviceFloppy, IconInfoCircle } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { CreateInstallmentAmountFormSchemaInputType, createInstallmentAmountSchema } from "utils/form-validations/installment-amount/createInstallmentAmount";

type Props = {
    opened: boolean;
    close: () => void;
}
const AddNewInstallmentAmount = ({ opened, close }: Props) => {
    const {
        setError,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateInstallmentAmountFormSchemaInputType>({
        resolver: zodResolver(createInstallmentAmountSchema, {}, { raw: true }),
        defaultValues: { amount: 1 }
    });

    const onSubmit: SubmitHandler<CreateInstallmentAmountFormSchemaInputType> = async (data) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }
        // send it to the server with server actions
        const result = await createInstallmentAmount(formData);
        if (result.status === 'ERROR') {
            if (result.error) {
                for (const e in result.error!) {
                    setError(e as any, { message: String(result.error?.[e as ("amount")]) });
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
    return <Modal
        size="lg" opened={opened}
        onClose={close}
        title="Add New Installment Amount"
    >
        <form onSubmit={handleSubmit(onSubmit)}>
            <Alert mb={rem(10)} variant="light" color="pink" title="Caution" icon={<IconInfoCircle />}>
                If you add a new installment amount, all other ones will be deprecated!
            </Alert>
            <TextInput
                withAsterisk
                type="number"
                label="Amount"
                {...register('amount')}
                error={errors.amount?.message}
                rightSection={<>IRT</>}
            //TODO IRT must be replace with currency config
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
    </Modal>
}

export default AddNewInstallmentAmount;

