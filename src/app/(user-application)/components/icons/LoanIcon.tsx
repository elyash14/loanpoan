import { HandCoins, type LucideProps } from "lucide-react";

export function LoanIcon({ strokeWidth = 1.75, ...props }: LucideProps) {
    return <HandCoins strokeWidth={strokeWidth} {...props} />;
}
