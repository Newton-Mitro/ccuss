import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export interface VaultSessionListItem {
    id: number;
    status: 'OPEN' | 'CLOSING' | 'CLOSED';
    opening_cash: string | number;
    closing_cash?: string | number | null;
    expected_cash?: string | number | null;
    cash_difference?: string | number | null;
    opened_at?: string | null;
    closed_at?: string | null;
    vault?: { code: string; name: string } | null;
    branch_day?: {
        business_date: string;
        branch?: { name: string; code: string } | null;
    } | null;
    opened_by?: { name: string } | null;
    closed_by?: { name: string } | null;
}

export type VaultSessionListResponse =
    TreasuryListResponse<VaultSessionListItem>;
export type VaultSessionFilters = TreasuryListFilters;

export interface VaultSessionIndexProps extends SharedData {
    vault_sessions: VaultSessionListResponse;
    branch_day?: { id: number; business_date: string } | null;
    vaults: { id: number; code: string; name: string }[];
    filters: VaultSessionFilters;
}
