export interface VaultDetails {
    id: number;
    code: string;
    name: string;
    status: string;
    maximum_balance: string | number | null;
    cash_location?: {
        branch?: { name: string } | null;
        financial_account?: {
            account_no: string;
            balance: string | number;
        } | null;
    } | null;
}
