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
    financial_account?: {
        account_no: string;
        name?: string | null;
        holder?: { name?: string | null; customer_no?: string | null } | null;
    } | null;
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
