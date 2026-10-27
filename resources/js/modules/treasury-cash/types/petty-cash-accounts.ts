import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/modules/treasury-cash/types/common';
import type { SharedData } from '@/types';

export type PettyCashFundMethod = 'IMPREST' | 'VARIABLE';
export type PettyCashFundStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface PettyCashFundListItem {
    id: number;
    code: string;
    name: string;
    fund_limit: string | number;
    current_balance: string | number;
    method: PettyCashFundMethod;
    status: PettyCashFundStatus;
    custodian?: { name: string } | null;
    cash_location?: { branch?: { name: string; code: string } | null } | null;
}

export type PettyCashFundListResponse =
    TreasuryListResponse<PettyCashFundListItem>;
export type PettyCashFundFilters = TreasuryListFilters;

export interface PettyCashIndexProps extends SharedData {
    funds: PettyCashFundListResponse;
    filters: PettyCashFundFilters;
}
