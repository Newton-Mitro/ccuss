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

export interface ChequeListItem {
    id: number;
    cheque_no: string;
    status: ChequeStatus;
    cheque_date?: string | null;
    amount?: string | number | null;
    payee?: string | null;
    cheque_book?: {
        book_no: string;
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
