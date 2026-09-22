import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export interface TellerSessionListItem {
    id: number;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opening_cash: string | number;
    closing_cash?: string | number | null;
    expected_cash?: string | number | null;
    cash_difference?: string | number | null;
    opened_at?: string | null;
    closed_at?: string | null;
    teller?: { code: string; name: string } | null;
    branch_day?: {
        business_date: string;
        branch?: { name: string; code: string } | null;
    } | null;
    opened_by?: { name: string } | null;
    closed_by?: { name: string } | null;
}

export type TellerSessionListResponse =
    TreasuryListResponse<TellerSessionListItem>;
export type TellerSessionFilters = TreasuryListFilters;

export interface TellerSessionIndexProps extends SharedData {
    teller_sessions: TellerSessionListResponse;
    branch_day?: { id: number; business_date: string } | null;
    tellers: { id: number; code: string; name: string }[];
    filters: TellerSessionFilters;
}
