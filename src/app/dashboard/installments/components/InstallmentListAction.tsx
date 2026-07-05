import { Installment } from "@prisma/client";
import PayAnInstallmentAction from "./PayAnInstallmentAction";
import InstallmentDetailsModal, {
    InstallmentListRow,
} from "./InstallmentDetailsModal";

const InstallmentListAction = (row: InstallmentListRow) => {
    return (
        <>
            <InstallmentDetailsModal installment={row} />
            <PayAnInstallmentAction installment={row as Installment} />
        </>
    );
};

export default InstallmentListAction;
