export type LedgerAccount = {
    id: number;
    code: string;
    name: string;
    is_control_account: boolean;
    is_cash_account: boolean;
};

export type Mapping = {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account_id?: number;
    credit_account_id?: number;
    debit_account: LedgerAccount;
    credit_account: LedgerAccount;
};

export type Props = {
    accounts: LedgerAccount[];
    sourceTypes: string[];
    mapping?: Mapping | null;
};
