import { notifications } from "@mantine/notifications";
import classes from './notification.module.css';

type NotificationType = {
    title: string
    message: string
}

export const successNotification = ({ title, message }: NotificationType) => {
    return notifications.show({
        title,
        message,
        color: 'green',
        autoClose: false,
        classNames: {
            title: classes.titleSuccess,
            description: classes.description,
        }
    });
}

export const errorNotification = ({ title, message }: NotificationType) => {
    return notifications.show({
        title,
        message,
        color: 'pink',
        classNames: {
            title: classes.titleError,
            description: classes.description,
        }
    });
}