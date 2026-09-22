import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type TellerStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface TellerUserSummary {
    name: string;
    email: string;
}

export interface TellerBranchSummary {
    name: string;
    code: string;
}

export interface TellerCashLocation {
    code: string;
    name: string;
    branch?: TellerBranchSummary | null;
}

export interface TellerListItem {
    id: number;
    code: string;
    name: string;
    status: TellerStatus;
    maximum_cash?: string | number | null;
    user?: TellerUserSummary | null;
    cash_location?: TellerCashLocation | null;
}

export type TellerListResponse = TreasuryListResponse<TellerListItem>;
export type TellerFilters = TreasuryListFilters;

export interface TellerIndexProps extends SharedData {
    tellers: TellerListResponse;
    filters: TellerFilters;
}
