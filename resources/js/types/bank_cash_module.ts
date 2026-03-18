import { User } from './user';

export interface Bank {
    id: number;
    name: string;
    short_name?: string;
    swift_code?: string;
    routing_number?: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    branches?: BankBranch[];
    accounts?: BankAccount[];
}

export interface BankBranch {
    id: number;
    bank_id: number;
    name: string;
    routing_number?: string;
    address?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    bank?: Bank;
    accounts?: BankAccount[];
}

export interface BankAccount {
    id: number;
    bank_id: number;
    bank_branch_id?: number;
    account_name: string;
    account_number: string;
    iban?: string;
    opening_balance: number;
    currency: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    created_by?: number;
    approved_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    bank?: Bank;
    branch?: BankBranch;
    createdBy?: User;
    approvedBy?: User;
    transactions?: BankTransaction[];
    cheques?: BankCheque[];
    reconciliations?: BankReconciliation[];
}

export interface BankTransaction {
    id: number;
    bank_account_id: number;
    type:
        | 'DEPOSIT'
        | 'WITHDRAW'
        | 'TRANSFER'
        | 'CHEQUE_DEPOSIT'
        | 'CHEQUE_ISSUE';
    debit: number;
    credit: number;
    balance_after?: number;
    transaction_date: string;
    reference_no?: string;
    reference_type?: string;
    reference_id?: number;
    remarks?: string;
    created_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    account?: BankAccount;
    creator?: User;
    reference?: BankCheque | BankTransaction | null;
}

export interface BankCheque {
    id: number;
    bank_account_id: number;
    cheque_no: string;
    type: 'ISSUED' | 'RECEIVED';
    amount: number;
    payee?: string;
    cheque_date: string;
    status: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';
    remarks?: string;
    created_by?: number;
    approved_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    account?: BankAccount;
    createdBy?: User;
    approvedBy?: User;
    transactions?: BankTransaction[];
}

export interface BankReconciliation {
    id: number;
    bank_account_id: number;
    reconcile_date: string;
    statement_balance: number;
    system_balance: number;
    notes?: string;
    created_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    account?: BankAccount;
    createdBy?: User;
}
