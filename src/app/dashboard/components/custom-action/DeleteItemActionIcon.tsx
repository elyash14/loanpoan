import { deleteAccount } from "@database/account/actions";
import { ActionIcon, Button, Modal, Text, Tooltip, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertOctagonFilled, IconTrashX } from "@tabler/icons-react";
import { errorNotification, successNotification } from "utils/Notification/notification";

type DeleteItemActionIconProps = {
    tooltipLabel: string;
    itemName: string;
    id: number;
}

const DeleteItemActionIcon = (props: DeleteItemActionIconProps) => {
    const { tooltipLabel, itemName, id } = props;
    const [opened, { open, close }] = useDisclosure(false);

    const handleDelete = async () => {
        const result = await deleteAccount(id);
        if (result.status === 'ERROR') {
            errorNotification({
                title: 'Error',
                message: result.message,
            });
        }
        else if (result.status === 'SUCCESS') {
            successNotification({
                title: 'Success',
                message: result.message,
            });
        }
        close();
    }

    return <>
        <Tooltip label={tooltipLabel}>
            <ActionIcon
                size="sm"
                variant="light"
                mr={rem(3)}
                color="pink"
                onClick={open}
            >
                <IconTrashX />
            </ActionIcon>
        </Tooltip>

        <Modal
            opened={opened}
            onClose={close}
            title={<Text display="flex" c="pink">Delete Item &nbsp;<IconAlertOctagonFilled /></Text>}
        >
            <p>Are you sure to delete {itemName} ?!</p>
            <Button color="pink" mr={rem(5)} onClick={handleDelete}>Confirm!</Button>
            <Button onClick={close}>Cancel</Button>
        </Modal>
    </>
}

export default DeleteItemActionIcon;