import { User } from './user';

export interface DepositProduct {
    id: number;
    code: string;
    name: string;
    short_name?: string;
    type: 'Deposit' | 'Loan' | 'Share';
    subtype: string;
    interest_rate?: number;
    interest_compounding: 'daily' | 'monthly' | 'quarterly' | 'yearly';
    minimum_balance: number;
    maximum_balance?: number;
    monthly_deposit_limit?: number;
    minimum_tenure_months?: number;
    maximum_tenure_months?: number;
    allow_partial_withdrawal: boolean;
    allow_early_closure: boolean;
    is_active: boolean;
    policies?: Record<string, any>;
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    createdBy?: User;
    updatedBy?: User;
    accounts?: DepositAccount[];
}

export interface DepositAccount {
    id: number;
    account_no: string;
    account_name: string;
    customer_id: number;
    deposit_product_id: number;
    branch_id?: number;
    balance: number;
    available_balance: number;
    hold_balance: number;
    interest_rate?: number;
    minimum_balance: number;
    opened_at: string;
    closed_at?: string;
    status: 'pending' | 'active' | 'dormant' | 'frozen' | 'closed';
    remarks?: string;
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    product?: DepositProduct;
    branch?: any; // Branch interface if exists
    holders?: DepositAccountHolder[];
    nominees?: DepositAccountNominee[];
    shareDetails?: ShareAccountDetail;
    termDeposit?: TermDepositDetail;
    recurringDeposit?: RecurringDepositDetail;
    journals?: DepositTransaction[];
    fees?: DepositAccountFee[];
    cheques?: ChequeBook[];
}

export interface DepositAccountHolder {
    id: number;
    deposit_account_id: number;
    customer_id: number;
    holder_type: 'primary' | 'JOINT' | 'AUTHORIZED';
    ownership_percent?: number;
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    createdBy?: User;
    updatedBy?: User;
}

export interface DepositAccountNominee {
    id: number;
    deposit_account_id: number;
    name: string;
    relation: string;
    date_of_birth?: string;
    allocation_percent: number;
    remarks?: string;
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    createdBy?: User;
    updatedBy?: User;
}

export interface ShareAccountDetail {
    id: number;
    deposit_account_id: number;
    shares_owned: number;
    share_value: number;
    voting_rights: boolean;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
}

export interface TermDepositDetail {
    deposit_account_id: number;
    tenure_months: number;
    maturity_amount: number;
    premature_penalty_rate: number;
    payout_mode: 'maturity' | 'monthly';

    account?: DepositAccount;
}

export interface RecurringDepositDetail {
    deposit_account_id: number;
    installment_amount: number;
    installment_frequency: 'monthly' | 'quarterly' | 'annual';
    total_installments: number;
    paid_installments: number;
    next_due_date?: string;
    penalty_rate: number;
    grace_days: number;
    maturity_amount: number;

    account?: DepositAccount;
    installments?: RecurringDepositInstallment[];
}

export interface RecurringDepositInstallment {
    id: number;
    deposit_account_id: number;
    installment_no: number;
    due_date: string;
    amount_due: number;
    amount_paid: number;
    paid_on?: string;
    status: 'due' | 'paid' | 'missed';
    penalty_amount: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
}

export interface DepositTransaction {
    id: number;
    transaction_no: string;
    deposit_account_id: number;
    transaction_type:
        | 'deposit'
        | 'withdraw'
        | 'transfer'
        | 'interest'
        | 'penalty'
        | 'cheque_withdrawal'
        | 'cheque_deposit'
        | 'reversal';
    amount: number;
    balance_after?: number;
    transaction_date: string;
    reference_no?: string;
    remarks?: string;
    created_by?: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    createdBy?: User;
    lines?: DepositTransactionLine[];
}

export interface DepositTransactionLine {
    id: number;
    deposit_transaction_id: number;
    deposit_account_id: number;
    debit: number;
    credit: number;
    description?: string;
    created_at: string;
    updated_at: string;

    transaction?: DepositTransaction;
    account?: DepositAccount;
}

export interface DepositAccountStatement {
    id: number;
    deposit_account_id: number;
    deposit_transaction_id: number;
    debit: number;
    credit: number;
    balance: number;
    posted_at: string;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    transaction?: DepositTransaction;
}

export interface DepositInterestAccrual {
    id: number;
    deposit_account_id: number;
    accrual_date: string;
    accrued_interest: number;
    is_posted: boolean;
    deposit_transaction_id?: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    transaction?: DepositTransaction;
}

export interface DepositPenalty {
    id: number;
    deposit_account_id: number;
    penalty_date: string;
    penalty_amount: number;
    penalty_type: 'late_payment' | 'premature_withdrawal' | 'overdue' | 'other';
    is_posted: boolean;
    deposit_transaction_id?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    transaction?: DepositTransaction;
}

export interface DepositAccountFee {
    id: number;
    deposit_account_id: number;
    fee_type: string;
    amount: number;
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
    applied_on?: string;
    is_paid: boolean;
    paid_transaction_id?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    transaction?: DepositTransaction;
}

export interface ChequeBook {
    id: number;
    deposit_account_id: number;
    book_no: string;
    start_number: number;
    end_number: number;
    issued_at?: string;
    issued_by?: number;
    created_at: string;
    updated_at: string;

    account?: DepositAccount;
    issuedBy?: User;
    cheques?: Cheque[];
}

export interface Cheque {
    id: number;
    cheque_book_id: number;
    cheque_number: string;
    cheque_date?: string;
    amount: number;
    payee_name?: string;
    remarks?: string;
    status:
        | 'unused'
        | 'issued'
        | 'presented'
        | 'cleared'
        | 'bounced'
        | 'cancelled';
    deposit_transaction_id?: number;
    created_at: string;
    updated_at: string;

    book?: ChequeBook;
    transaction?: DepositTransaction;
}

export interface ChequeStopPayment {
    id: number;
    cheque_id: number;
    reason?: string;
    requested_by?: number;
    requested_at: string;
    created_at: string;
    updated_at: string;

    cheque?: Cheque;
    requestedBy?: User;
}
