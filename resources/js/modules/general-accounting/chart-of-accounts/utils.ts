/* ---------------------------------------------
 | Constants
 --------------------------------------------- */
export const TYPE_COLORS: Record<string, string> = {
    ASSET: 'bg-green-100 text-green-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-blue-100 text-blue-800',
    INCOME: 'bg-purple-100 text-purple-800',
    EXPENSE: 'bg-yellow-100 text-yellow-800',
};

export function calculateClosingBalance(account: any): number {
    let ownBalance = 0;

    if (account.balances?.length) {
        const balance = account.balances[0];

        const opening = Number(balance.opening_balance ?? 0);
        const debit = Number(balance.debit_total ?? 0);
        const credit = Number(balance.credit_total ?? 0);

        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            ownBalance = opening + debit - credit;
        } else {
            ownBalance = opening + credit - debit;
        }
    }

    if (!account.children_recursive?.length) {
        return ownBalance;
    }

    const childrenTotal = account.children_recursive.reduce(
        (sum: number, child: any) => sum + calculateClosingBalance(child),
        0,
    );

    return ownBalance + childrenTotal;
}
