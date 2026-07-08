export type HomeDashboardData = {
    userAvatar: string | null;
    userProfileColor: string | null;
    totalBalance: string;
    notice: {
        overdueCount: number;
        overdueAmount: string;
        upcomingCount: number;
        upcomingAmount: string;
        nextDue: { dueDate: string; amount: string } | null;
    };
    activeLoan: {
        id: number;
        accountCode: string;
        accountId: number;
        amount: string;
        paidCount: number;
        paymentCount: number;
        progressPercent: number;
        remainingAmount: string;
    } | null;
    queue: {
        position: number;
        totalEligible: number;
    } | null;
    punctualityScore: number;
    loanRanking: {
        byCount: {
            position: number;
            totalUsers: number;
            loanCount: number;
        };
        byAmount: {
            position: number;
            totalUsers: number;
            loanAmount: string;
        };
    } | null;
    globalStats: {
        totalBankBalance: string;
        totalLoanCount: number;
        activeLoanCount: number;
        totalLoanAmount: string;
        activeLoanAmount: string;
        memberCount: number;
        activeLoanMemberCount: number;
    };
};

export type HomeTabId = "status" | "personal" | "global";
