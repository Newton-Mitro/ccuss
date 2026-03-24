import { AuditFields } from './base_types';
import { Branch } from './branch';
import { User } from './user';

// Fiscal Year
export interface FiscalYear extends AuditFields {
    id: number;
    code: string; // e.g. "FY-2025-26"
    start_date: string; // ISO date
    end_date: string; // ISO date
    is_active: boolean;
    is_closed: boolean;
}

// Fiscal Period
export interface FiscalPeriod extends AuditFields {
    id: number;
    fiscal_year_id: number;
    period_name: string; // e.g. "JAN-2026"
    start_date: string;
    end_date: string;
    is_open: boolean;
}

// Account
export interface LedgerAccount extends AuditFields {
    id: number;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    is_control_account: boolean;
    is_active: boolean;
    is_leaf: boolean;
    parent_id?: number | null;
}

// Voucher Line
export interface VoucherLine extends AuditFields {
    id: number;
    voucher_id: number;

    ledger_account_id: number;
    ledger_account?: LedgerAccount;

    // Polymorphic subledger (DepositAccount, LoanAccount, etc.)
    subledger_id?: number | null;
    subledger_type?: string | null;
    subledger?: object | null;

    // Instrument details
    instrument_type_id?: number | null;
    instrument_id?: number | null;

    particulars?: string | null;

    debit: number;
    credit: number;
    dr_cr: 'DR' | 'CR';

    is_selected?: boolean;
}

// Voucher
export interface Voucher extends AuditFields {
    id: number;
    fiscal_year_id?: number | null;
    accounting_period_id?: number | null;
    branch_id?: number | null;
    voucher_date: string; // timestamp
    voucher_type:
        | 'OPENING_BALANCE'
        | 'CLOSING_BALANCE'
        | 'CREDIT_OR_RECEIPT'
        | 'DEBIT_OR_PAYMENT'
        | 'JOURNAL_OR_NON_CASH'
        | 'PURCHASE'
        | 'SALE'
        | 'DEBIT_NOTE'
        | 'CREDIT_NOTE'
        | 'CONTRA';
    voucher_no: string;
    reference?: string | null;
    narration: string;
    total_amount: number;
    lines?: VoucherLine[];

    posted_by?: number | null;
    posted_at?: string | null;
    approved_by?: number | null;
    approved_at?: string | null;
    rejected_by?: number | null;
    rejected_at?: string | null;

    status: 'pending' | 'approved' | 'POSTED' | 'cancelled';

    poster?: User;
    approver?: User;
    rejector?: User;
    branch?: Branch;
    fiscal_year?: FiscalYear;
    accounting_period?: FiscalPeriod;
}

// Account Balance
export interface AccountBalance extends AuditFields {
    id: number;
    ledger_account_id: number;
    accounting_period_id: number;
    opening_balance: number;
    debit_total: number;
    credit_total: number;
    closing_balance: number;
}
