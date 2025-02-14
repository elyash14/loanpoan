'use client'

import { Grid } from "@mantine/core";
import { Loan } from "@prisma/client";
import AccountInstallments from "./AccountInstallments";
import AccountLoans from "./AccountLoans";

type Props = {
    id: number, // account id
    loansCount: number,
    currentLoanData: string,
}

const AccountOtherInfo = ({ id, loansCount, currentLoanData }: Props) => {
    const currentLoan: Loan = JSON.parse(currentLoanData);

    return <>
        <Grid>
            <Grid.Col span={6} >
                <h3>Installments</h3>
                <AccountInstallments id={id} />
            </Grid.Col>
            <Grid.Col span={6}>
                <h3>Loans</h3>
                <AccountLoans currentLoan={currentLoan} loansCount={loansCount} />
            </Grid.Col>
        </Grid>
    </>
}
export default AccountOtherInfo;