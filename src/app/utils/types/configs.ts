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
    };
    installment?: {
        dueDay: number;
        payDay: number;
    }
}

//TODO make a seeder to seed a default value for this config