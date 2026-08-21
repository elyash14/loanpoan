"use client";

import { generateAllUndueInstallments } from "@database/installments/actions";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorNotification, successNotification } from "utils/Notification/notification";

const GenerateMonthlyInstallments = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateAllUndueInstallments();
            if (result.status === "ERROR") {
                errorNotification({
                    title: "Error",
                    message: result.message,
                });
            } else {
                successNotification({
                    title: "Done",
                    message: result.message,
                });
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            errorNotification({
                title: "Error",
                message: "Failed to generate installments",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="xs"
            rightSection={<IconPlus size={14} />}
            loading={loading}
            onClick={handleGenerate}
        >
            Generate Monthly Installments
        </Button>
    );
};

export default GenerateMonthlyInstallments;
