/* ---------------- Types ---------------- */

export type EquityLine = {
    account_code: string;
    account_name: string;
    period_name: string | null;
    opening_balance: number | null;
    net_profit: number | null;
    ending_balance: number | null;
};
