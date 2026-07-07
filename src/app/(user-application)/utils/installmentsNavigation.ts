export type InstallmentsFrom = "account" | "more" | "home";

export function getInstallmentsBackHref(
    from?: string,
    accountId?: string | number,
    fromAccountId?: string | number,
): string {
    const returnAccountId = fromAccountId ?? accountId;
    if (from === "account" && returnAccountId) {
        return `/accounts/${returnAccountId}`;
    }
    if (from === "more") return "/more";
    if (from === "home") return "/home";
    return "/more";
}

export function installmentsQueryParams(params: {
    from?: string;
    fromAccount?: string | number;
    account?: string | number;
    status?: string;
}) {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.fromAccount) search.set("fromAccount", String(params.fromAccount));
    if (params.account) search.set("account", String(params.account));
    if (params.status) search.set("status", params.status);
    const query = search.toString();
    return query ? `/installments?${query}` : "/installments";
}
