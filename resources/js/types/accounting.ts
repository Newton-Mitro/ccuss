import { Branch } from './branch';
import { User } from './user';

// Fiscal Year
export interface FiscalYear {
    id: number;
    code: string; // e.g. "FY-2025-26"
    start_date: string; // ISO date
    end_date: string; // ISO date
    is_active: boolean;
    is_closed: boolean;
    created_at: string;
    updated_at: string;
}

// Fiscal Period
export interface FiscalPeriod {
    id: number;
    fiscal_year_id: number;
    period_name: string; // e.g. "JAN-2026"
    start_date: string;
    end_date: string;
    is_open: boolean;
    created_at: string;
    updated_at: string;
}

// Account
export interface Account {
    id: number;
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
    is_control_account: boolean;
    is_active: boolean;
    is_leaf: boolean;
    parent_id?: number | null;
    created_at: string;
    updated_at: string;
}

// Voucher Line
export interface VoucherLine {
    id: number;
    voucher_id: number;
    ledger_account_id: number;
    account?: Account;
    subledger_id?: number | null;
    subledger_type?: string | null;
    associate_ledger_id?: number | null;
    narration?: string | null;
    debit: number;
    credit: number;
    created_at: string;
    updated_at: string;
}

// Voucher
export interface Voucher {
    id: number;
    fiscal_year_id?: number | null;
    fiscal_period_id?: number | null;
    branch_id?: number | null;
    voucher_date: string; // timestamp
    voucher_type:
        | 'RECEIPT'
        | 'PAYMENT'
        | 'JOURNAL'
        | 'PURCHASE'
        | 'SALE'
        | 'DEBIT NOTE'
        | 'CREDIT NOTE'
        | 'PETTY CASH'
        | 'CONTRA';
    voucher_no: string;
    reference?: string | null;
    approved_by?: number | null;
    approved_at?: string | null;
    created_by: number;
    narration: string;
    status: 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';
    created_at: string;
    updated_at: string;

    // Optional relations
    fiscal_year?: FiscalYear;
    fiscal_period?: FiscalPeriod;
    branch?: Branch;
    creator?: User;
    approver?: User;
    lines?: VoucherLine[];
}

// Account Balance
export interface AccountBalance {
    id: number;
    ledger_account_id: number;
    fiscal_period_id: number;
    opening_balance: number;
    debit_total: number;
    credit_total: number;
    closing_balance: number;
    created_at: string;
    updated_at: string;
}
