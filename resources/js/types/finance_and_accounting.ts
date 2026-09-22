import { Timestamped } from './base_types';

// Fiscal Year
export interface FiscalYear extends Timestamped {
    id: number;
    name: string;
    start_date: string; // ISO date
    end_date: string; // ISO date
    status: 'OPEN' | 'CLOSED';
    is_current: boolean;
    code?: string;
    is_active?: boolean;
    is_closed?: boolean;
}

// Fiscal Period
export interface FiscalPeriod extends Timestamped {
    id: number;
    fiscal_year_id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED';
    period_name?: string;
    is_open?: boolean;
}

// Account
export type AccountType =
    | 'ASSET'
    | 'LIABILITY'
    | 'EQUITY'
    | 'INCOME'
    | 'EXPENSE';

export interface LedgerAccount extends Timestamped {
    id: number;
    organization_id: number;
    account_group_id: number;

    code: string;
    name: string;
    description?: string | null;

    type: AccountType;
    normal_balance: 'DEBIT' | 'CREDIT';
    level: number;

    is_control_account: boolean;
    is_reconcilable: boolean;
    is_cash_account?: boolean;
    is_system: boolean;
    status: boolean;

    parent_id?: number | null;

    parent?: LedgerAccount | null;
    children?: LedgerAccount[];

    // Optional resource projections retained for existing accounting pages.
    is_group?: boolean;
    is_active?: boolean;
    subledger_type?: string | null;
    subledger_sub_type?: string | null;
    children_recursive?: LedgerAccount[];
}

// Account Balance
export interface AccountBalance extends Timestamped {
    id: number;
    ledger_account_id: number;
    fiscal_period_id: number;
    opening_balance: number;
    debit_total: number;
    credit_total: number;
    closing_balance: number;
}

export interface VoucherLine {
    id: number | string;
    voucher_id?: number | null;
    account_id?: number | null;
    voucher_entry_id?: number | null;
    ledger_account_id?: number | null;
    ledger_account?: any | null;
    subledger_id?: number | null;
    subledger_type?: string | null;
    subledger?: any | null;
    reference_id?: number | null;
    reference_type?: string | null;
    reference?: any | null;
    instrument_type?: string | null;
    instrument_type_id?: number | string | null;
    instrument_id?: number | string | null;
    instrument_no?: string | null;
    particulars?: string | null;
    debit?: number | string | null;
    credit?: number | string | null;
    created_by?: number | null;
    created_by_user?: any | null;
    updated_by?: number | null;
    updated_by_user?: any | null;
    created_at?: string | null;
    updated_at?: string | null;
}
