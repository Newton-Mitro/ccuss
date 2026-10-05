import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type ChequeStatus =
    | 'UNUSED'
    | 'ISSUED'
    | 'PRESENTED'
    | 'CLEARED'
    | 'BOUNCED'
    | 'STOPPED'
    | 'CANCELLED'
    | 'EXPIRED';

export interface ChequeFinancialAccount {
    id: number;
    account_no: string;
    name?: string | null;
    account_type: string;
    holder?: {
        name: string;
        customer_no?: string | null;
    } | null;
}

export interface ChequeListItem {
    id: number;
    cheque_no: string;
    status: ChequeStatus;
    cheque_date?: string | null;
    amount?: string | number | null;
    payee?: string | null;
    financial_account?: ChequeFinancialAccount | null;
    cheque_book?: {
        book_no: string;
        financial_account?: ChequeFinancialAccount | null;
        bank_account?: {
            account_name: string;
            bank?: { name: string } | null;
        } | null;
    } | null;
}

export type ChequeListResponse = TreasuryListResponse<ChequeListItem>;
export type ChequeFilters = TreasuryListFilters;

export interface ChequeIndexProps extends SharedData {
    cheques: ChequeListResponse;
    filters: ChequeFilters;
}
