import { FiscalPeriod } from '@/modules/general-accounting/types/finance_and_accounting';
import { SharedData } from '@/types';

/* ---------------- Types ---------------- */

export interface TrialBalanceRow {
    ledger_account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    fiscal_year_id: number;
    fiscal_year_code: string;
    fiscal_period_id: number;
    period_name: string;
    total_debit: number;
    total_credit: number;
    balance: number;
}

export interface Props extends SharedData {
    trialBalance: TrialBalanceRow[];
    fiscalPeriods: (FiscalPeriod & { fiscal_year_name: string })[];
    selectedFiscalPeriod?: number;
}
