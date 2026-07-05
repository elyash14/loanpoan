export function formatMoney(value: string | number | null | undefined, symbol = ""): string {
    const num = Number(value ?? 0);
    const formatted = Number.isFinite(num) ? num.toLocaleString() : "0";
    return symbol ? `${symbol} ${formatted}` : formatted;
}
