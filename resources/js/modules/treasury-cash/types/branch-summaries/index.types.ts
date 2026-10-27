export type Summary = {
    id: number;
    opening_cash: string | number;
    cash_received: string | number;
    cash_paid: string | number;
    vault_balance: string | number;
    teller_balance: string | number;
    petty_cash_balance: string | number;
    closing_cash: string | number;
    cash_difference: string | number;
    branch_day?: { business_date: string; status: string };
};

export type Props = {
    summaries: { data: Summary[] };
    branchDays: { id: number; business_date: string; status: string }[];
};
