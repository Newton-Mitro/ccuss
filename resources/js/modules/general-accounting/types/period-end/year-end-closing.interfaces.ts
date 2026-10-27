import { SharedData } from '@/types';

export interface FiscalYear {
    id: number;
    name: string;
    status: 'OPEN' | 'CLOSED';
    periods_count: number;
    closed_periods_count: number;
    draft_vouchers_count: number;
}

export interface Props extends SharedData {
    fiscalYears: FiscalYear[];
    retainedEarningsAccounts: { id: number; code: string; name: string }[];
}
