'use client'

import { Grid } from "@mantine/core";
import { Installment, Loan } from "@prisma/client";
import AccountInstallments from "./AccountInstallments";
import AccountLoans from "./AccountLoans";

type Props = {
    id: number, // account id
    loansCount: number,
    currentLoanData: string,
    installmentsCount: number,
    latestInstallmentsData: string,
}

const AccountOtherInfo = ({ id, loansCount, currentLoanData, installmentsCount, latestInstallmentsData }: Props) => {
    const currentLoan: Loan = JSON.parse(currentLoanData);
    const latestInstallments: Installment[] = JSON.parse(latestInstallmentsData);
    return <>
        <Grid>
            <Grid.Col span={6} >
                <h3>Installments</h3>
                <AccountInstallments id={id} installmentsCount={installmentsCount} latestInstallments={latestInstallments} />
            </Grid.Col>
            <Grid.Col span={6}>
                <h3>Loans</h3>
                <AccountLoans currentLoan={currentLoan} loansCount={loansCount} accountId={id} />
            </Grid.Col>
        </Grid>
    </>
}
export default AccountOtherInfo;