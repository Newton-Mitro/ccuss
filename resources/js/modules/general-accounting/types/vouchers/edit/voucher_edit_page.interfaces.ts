import { SharedData } from '@/types';

export interface Account {
    id: number;
    code: string;
    name: string;
}

export interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
}

export interface VoucherEntry {
    id?: number;
    account_id: number;
    party_id?: number | string | null;
    account?: Account;
    party?: Party | null;
    debit: number | string;
    credit: number | string;
    description?: string | null;
    reference?: string | null;
}

export interface Voucher {
    id: number;
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    fiscal_period_id: number;
    description?: string | null;
    status: string;
    entries: VoucherEntry[];
}

export interface Props extends SharedData {
    voucher: Voucher;
    accounts: Account[];
    parties: Party[];
    fiscalPeriods: { id: number; name?: string; period_name?: string }[];
}
