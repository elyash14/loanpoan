import { generateAllUndueInstallments } from "@database/installments/actions";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

const GenerateMonthlyInstallments = () => {
    return <Button size="xs" rightSection={<IconPlus size={14} />} onClick={async () => {
        await generateAllUndueInstallments()
    }} >
        Generate Monthly Installments
    </Button>
}

export default GenerateMonthlyInstallments;