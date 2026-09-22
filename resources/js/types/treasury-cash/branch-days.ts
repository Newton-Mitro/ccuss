import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export interface BranchDayListItem {
    id: number;
    business_date: string;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opened_at?: string | null;
    closed_at?: string | null;
    branch?: { id: number; name: string; code: string } | null;
    opened_by?: { id: number; name: string } | null;
    closed_by?: { id: number; name: string } | null;
}

export type BranchDayListResponse = TreasuryListResponse<BranchDayListItem>;
export type BranchDayFilters = TreasuryListFilters;

export interface BranchDayIndexProps extends SharedData {
    branch_days: BranchDayListResponse;
    filters: BranchDayFilters;
}
