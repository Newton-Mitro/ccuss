import { SharedData } from '@/types';

export interface LedgerEntry {
    id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    entry_description?: string;
    debit: number;
    credit: number;
    running_balance: number;
}

export interface FiscalPeriod {
    id: number;
    name: string;
}

export interface Props extends SharedData {
    account: { id: number; code: string; name: string } | null;
    entries: LedgerEntry[];
    accounts: { id: number; code: string; name: string }[];
    fiscalPeriods: FiscalPeriod[];
    filters: { account_id?: string; fiscal_period_id?: string };
}
