import { LoanStatus } from "@prisma/client";

export const statusValue = (status: LoanStatus) => {
    return status === "FINISHED" ? "Finished" : "In Progress";
}