export interface TellerDetails {
    id: number;
    code: string;
    name: string;
    status: string;
    maximum_cash: string | number | null;
    user?: { name: string; email: string } | null;
    cash_location?: {
        branch?: { name: string } | null;
        financial_account?: {
            account_no: string;
            balance: string | number;
        } | null;
    } | null;
}
