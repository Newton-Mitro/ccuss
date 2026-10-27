export type Reconciliation = {
    id: number;
    statement_date: string;
    statement_balance: string | number;
    book_balance: string | number;
    difference: string | number;
    status: string;
    bank_account?: { account_name?: string; account_number?: string };
};

export type Props = {
    reconciliations: { data: Reconciliation[] };
    accounts: { id: number; account_name: string; account_number: string }[];
};
