export type GlobalConfigType = {
    applicationName?: string;
    currency?: {
        name: string;
        symbol: string;
    };
    dateType?: "GREGORIAN" | "JALALI"
    loan?: {
        minimumFactor: number;
        maximumFactor: number;
        restrict: boolean;
    }
}