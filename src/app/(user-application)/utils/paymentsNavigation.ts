export type PaymentsFrom = "loan" | "more" | "home";

export function getPaymentsBackHref(
    from?: string,
    loanId?: string | number,
    fromLoanId?: string | number,
): string {
    const returnLoanId = fromLoanId ?? loanId;
    if (from === "loan" && returnLoanId) {
        return `/loans/${returnLoanId}`;
    }
    if (from === "more") return "/more";
    if (from === "home") return "/home";
    return "/more";
}

export function paymentsQueryParams(params: {
    from?: string;
    fromLoan?: string | number;
    loan?: string | number;
    status?: string;
}) {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.fromLoan) search.set("fromLoan", String(params.fromLoan));
    if (params.loan) search.set("loan", String(params.loan));
    if (params.status) search.set("status", params.status);
    const query = search.toString();
    return query ? `/payments?${query}` : "/payments";
}
