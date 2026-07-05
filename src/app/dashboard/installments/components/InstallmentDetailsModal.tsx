'use client';

import InfoList, { ListInfoType } from "@dashboard/components/list/InfoList";
import {
    ActionIcon,
    Badge,
    Modal,
    NumberFormatter,
    Text,
    Tooltip,
    rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Installment } from "@prisma/client";
import { IconEye } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

export type InstallmentListRow = Installment & {
    account: {
        id: number;
        code: string;
        user: { id: number; fullName: string };
    };
    approvedBy: { id: number; fullName: string } | null;
    installmentAmount: { id: number; amount: Installment["amount"] } | null;
};

type Props = {
    installment: InstallmentListRow;
};

const InstallmentDetailsModal = ({ installment }: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);
    const [opened, { open, close }] = useDisclosure(false);

    const infoList: ListInfoType[] = [
        {
            title: "ID",
            value: installment.id,
        },
        {
            title: "Account",
            value: (
                <Link
                    href={`/${DASHBOARD_URL}/accounts/${installment.account.id}/view`}
                >
                    {installment.account.code}
                </Link>
            ),
        },
        {
            title: "User",
            value: (
                <Link
                    href={`/${DASHBOARD_URL}/users/${installment.account.user.id}/view`}
                >
                    {installment.account.user.fullName}
                </Link>
            ),
        },
        {
            title: "Amount",
            value: (
                <NumberFormatter
                    value={String(installment.amount)}
                    thousandSeparator
                    prefix={`${currency?.symbol} `}
                />
            ),
        },
        {
            title: "Type",
            value: installment.type,
        },
        {
            title: "Status",
            value: installment.paidAt ? (
                <Badge color="green">Paid</Badge>
            ) : (
                <Badge color="orange">Not Paid</Badge>
            ),
        },
        {
            title: "Due Date",
            value: formatDate(installment.dueDate, dateType),
        },
        {
            title: "Created At",
            value: formatDate(installment.createdAt, dateType),
        },
    ];

    if (installment.installmentAmount) {
        infoList.push({
            title: "Base Amount",
            value: (
                <NumberFormatter
                    value={String(installment.installmentAmount.amount)}
                    thousandSeparator
                    prefix={`${currency?.symbol} `}
                />
            ),
        });
    }

    if (installment.paidAt) {
        infoList.push({
            title: "Paid At",
            value: formatDate(installment.paidAt, dateType),
        });
    }

    if (installment.approvedBy) {
        infoList.push({
            title: "Approved By",
            value: (
                <Link
                    href={`/${DASHBOARD_URL}/users/${installment.approvedBy.id}/view`}
                >
                    {installment.approvedBy.fullName}
                </Link>
            ),
        });
    }

    if (installment.approvedAt) {
        infoList.push({
            title: "Approved At",
            value: formatDate(installment.approvedAt, dateType),
        });
    }

    return (
        <>
            <Tooltip label="View Installment">
                <ActionIcon
                    size="sm"
                    variant="light"
                    mr={rem(3)}
                    onClick={open}
                >
                    <IconEye />
                </ActionIcon>
            </Tooltip>
            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Text fw="bold">
                        Installment #{installment.id}
                    </Text>
                }
                size="md"
            >
                <InfoList listData={infoList} />
            </Modal>
        </>
    );
};

export default InstallmentDetailsModal;
