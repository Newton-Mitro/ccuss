import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type ChequeBookStatus =
    | 'AVAILABLE'
    | 'IN_USE'
    | 'EXHAUSTED'
    | 'CANCELLED';

export interface ChequeBookListItem {
    id: number;
    book_no: string;
    prefix?: string | null;
    start_number: number;
    end_number: number;
    current_number?: number | null;
    leaf_count: number;
    issued_date?: string | null;
    status: ChequeBookStatus;
    bank_account?: {
        account_name: string;
        account_number: string;
        bank?: { name: string } | null;
    } | null;
}

export type ChequeBookListResponse = TreasuryListResponse<ChequeBookListItem>;
export type ChequeBookFilters = TreasuryListFilters;

export interface ChequeBookIndexProps extends SharedData {
    books: ChequeBookListResponse;
    filters: ChequeBookFilters;
}
