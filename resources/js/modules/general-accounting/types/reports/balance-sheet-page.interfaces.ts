import { SharedData } from '@/types';

export interface BalanceSheetRow {
    ledger_account_id: number;
    category: string;
    account_name: string;
    balance: number;
}

export interface FiscalYear {
    id: number;
    code: string;
}

export interface Props extends SharedData {
    balanceSheet: BalanceSheetRow[];
    fiscalYears: FiscalYear[];
    selectedFiscalYear?: number;
}
