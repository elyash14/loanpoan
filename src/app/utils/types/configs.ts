export type GlobalConfigType = {
    applicationName?: string;
    currency?: {
        name: string;
        symbol: string;
    };
}

export type WaitingListType = number[];