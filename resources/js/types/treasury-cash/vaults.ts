import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type VaultStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface VaultCashLocation {
    code: string;
    name: string;
    branch?: {
        name: string;
        code: string;
    } | null;
}

export interface VaultListItem {
    id: number;
    code: string;
    name: string;
    status: VaultStatus;
    maximum_balance?: string | number | null;
    cash_location?: VaultCashLocation | null;
}

export type VaultListResponse = TreasuryListResponse<VaultListItem>;
export type VaultFilters = TreasuryListFilters;

export interface VaultIndexProps extends SharedData {
    vaults: VaultListResponse;
    filters: VaultFilters;
}
