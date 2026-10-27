import {
    FiscalPeriod,
    FiscalYear,
} from '@/modules/general-accounting/types/finance_and_accounting';
import { SharedData } from '@/types';

/* ---------------- Types ---------------- */

export interface CashFlowRow {
    fiscal_year_code: string;
    period_name: string;
    cash_category: 'Operating' | 'Investing' | 'Financing' | 'Other';
    net_cash: number;
}

export interface Props extends SharedData {
    cashFlows: CashFlowRow[];
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    selectedFiscalYear?: number;
    selectedFiscalPeriod?: number;
}
