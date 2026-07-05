'use client';

import InfoList, { ListInfoType } from "@dashboard/components/list/InfoList";
import { Box } from "@mantine/core";
import { User } from "@prisma/client";
import { useAtomValue } from "jotai";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

type UserForView = User & {
    fullName: string;
    _count: { accounts: number };
};

type Props = {
    data: string;
};

const UserInfo = ({ data }: Props) => {
    const { dateType } = useAtomValue(globalConfigAtom);
    const user: UserForView = JSON.parse(data);

    const infoList: ListInfoType[] = [
        {
            title: "Full Name",
            value: user.fullName,
        },
        {
            title: "Email",
            value: user.email,
        },
        {
            title: "Gender",
            value: user.gender,
        },
        {
            title: "Role",
            value: user.role,
        },
        {
            title: "Card Number",
            value: user.cardNumber ?? "---",
        },
        {
            title: "Account Number",
            value: user.accountNumber ?? "---",
        },
        {
            title: "Created At",
            value: formatDate(user.createdAt, dateType),
        },
    ];

    if (user.deletedAt) {
        infoList.push({
            title: "Deleted At",
            value: formatDate(user.deletedAt, dateType),
        });
    }

    return (
        <Box pl="xl" maw={600}>
            <InfoList listData={infoList} />
        </Box>
    );
};

export default UserInfo;
