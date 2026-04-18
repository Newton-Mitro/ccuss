export interface BankAccount {
    id: number;

    bank_name: string;
    branch_name?: string;

    account_number: string;

    swift_code?: string;
    routing_number?: string;

    created_at: string;
    updated_at: string;
    deleted_at?: string;

    // relations (optional, loaded via API)
    reconciliations?: BankReconciliation[];
}

export interface BankReconciliation {
    id: number;

    bank_account_id: number;

    reconcile_date: string;

    statement_balance: number;
    system_balance: number;

    notes?: string;

    created_at: string;
    updated_at: string;
    deleted_at?: string;

    // relations
    account?: BankAccount;
}
