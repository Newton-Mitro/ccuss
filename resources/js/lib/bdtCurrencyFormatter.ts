/**
 * Format a number as Bangladeshi Taka currency
 * @param amount Number to format (can be null/undefined)
 * @param showSymbol Whether to include the "৳" symbol (default: true)
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatBDTCurrency(
    amount: number | string | null | undefined,
    showSymbol: boolean = true,
    decimals: number = 2,
): string {
    // Convert null/undefined or non-numeric to 0
    let value = Number(amount);
    if (isNaN(value)) value = 0;

    const fixedAmount = value.toFixed(decimals);
    const [integerPart, decimalPart] = fixedAmount.split('.');

    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedInteger =
        (otherNumbers
            ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ','
            : '') + lastThree;

    return `${showSymbol ? '৳' : ''}${formattedInteger}${decimals > 0 ? '.' + decimalPart : ''}`;
}
