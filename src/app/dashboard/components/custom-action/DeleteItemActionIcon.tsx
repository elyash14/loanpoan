import { ActionIcon, Button, Modal, Text, Tooltip, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertOctagonFilled, IconTrashX } from "@tabler/icons-react";

type DeleteItemActionIconProps = {
    tooltipLabel: string;
    itemName: string;
    id: number;
    handleDelete: (id: number) => void;
}

const DeleteItemActionIcon = (props: DeleteItemActionIconProps) => {
    const { tooltipLabel, itemName, id, handleDelete } = props;
    const [opened, { open, close }] = useDisclosure(false);

    const handleAction = () => {
        handleDelete(id);
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
            <Button color="pink" mr={rem(5)} onClick={handleAction}>Confirm!</Button>
            <Button onClick={close}>Cancel</Button>
        </Modal>
    </>
}

export default DeleteItemActionIcon;