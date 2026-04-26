import { Timestamped } from './base_types';

// Fiscal Year
export interface FiscalYear extends Timestamped {
    id: number;
    code: string; // e.g. "FY-2025-26"
    start_date: string; // ISO date
    end_date: string; // ISO date
    is_active: boolean;
    is_closed: boolean;
}

// Fiscal Period
export interface FiscalPeriod extends Timestamped {
    id: number;
    fiscal_year_id: number;
    period_name: string; // e.g. "JAN-2026"
    start_date: string;
    end_date: string;
    is_open: boolean;
}

// Account
export interface LedgerAccount extends Timestamped {
    id: number;
    organization_id: number;

    code: string;
    name: string;
    description?: string | null;

    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';

    is_group: boolean;
    is_control_account: boolean;
    is_active: boolean;

    subledger_type?: string | null;
    subledger_sub_type?: string | null;

    parent_id?: number | null;

    // 🔹 Relationships (optional when loaded)
    parent?: LedgerAccount | null;
    children?: LedgerAccount[];
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
