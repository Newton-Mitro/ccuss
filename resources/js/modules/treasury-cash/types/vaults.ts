import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/modules/treasury-cash/types/common';
import type { SharedData } from '@/types';

export type VaultStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface VaultCashLocation {
    code: string;
    name: string;
    financial_account?: {
        balance: string | number;
    } | null;
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
