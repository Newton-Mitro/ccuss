import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export interface BankListItem {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
    status: boolean;
    accounts_count?: number;
}

export type BankListResponse = TreasuryListResponse<BankListItem>;
export type BankFilters = TreasuryListFilters;

export interface BankIndexProps extends SharedData {
    banks: BankListResponse;
    filters: BankFilters;
}
