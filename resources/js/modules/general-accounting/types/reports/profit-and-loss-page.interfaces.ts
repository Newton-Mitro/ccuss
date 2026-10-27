import { SharedData } from '@/types';

export interface PLRow {
    ledger_account_id: number;
    category: 'income' | 'expense';
    account_name: string;
    amount: number;
    fiscal_year_id?: number;
    fiscal_period_id?: number;
}

export interface FiscalYear {
    id: number;
    code: string;
}

export interface FiscalPeriod {
    id: number;
    period_name: string;
}

export interface Props extends SharedData {
    profitAndLoss: PLRow[];
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    selectedFiscalYear?: number;
    selectedFiscalPeriod?: number;
}
