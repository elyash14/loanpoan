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
    };
    /** Language for bot messages sent to the Telegram group */
    telegramMessageLocale?: "en" | "fa";
}

//TODO make a seeder to seed a default value for this config