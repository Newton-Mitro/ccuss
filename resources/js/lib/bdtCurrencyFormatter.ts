/**
 * Format a number as Bangladeshi Taka currency
 * @param amount Number to format (can be null/undefined)
 * @param showSymbol Whether to include the "৳" symbol (default: true)
 * @returns Formatted string
 */
const bdtNumberFormatter = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatBDTCurrency(
    amount: number | string | null | undefined,
    showSymbol: boolean = true,
): string {
    const value = Number(amount);
    const formatted = bdtNumberFormatter.format(
        Number.isFinite(value) ? value : 0,
    );

    return `${showSymbol ? '৳ ' : ''}${formatted}`;
}
