export type Account = {
    id: number;
    code: string;
    name: string;
};

export type Mapping = {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account: Account;
    credit_account: Account;
};
