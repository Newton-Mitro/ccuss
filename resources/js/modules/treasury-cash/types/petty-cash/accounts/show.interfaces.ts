export interface PettyCashFundDetails {
    id: number;
    code: string;
    name: string;
    method: string;
    status: string;
    current_balance: string | number;
    fund_limit: string | number;
    custodian?: { name: string; email: string } | null;
    cash_location?: {
        branch?: { name: string } | null;
        financial_account?: {
            account_no: string;
            balance: string | number;
        } | null;
    } | null;
}
