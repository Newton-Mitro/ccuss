import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type AdvanceAccountMethod = 'IMPREST' | 'VARIABLE';
export type AdvanceAccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface AdvanceAccountListItem {
    id: number;
    code: string;
    name: string;
    fund_limit: string | number;
    current_balance: string | number;
    method: AdvanceAccountMethod;
    status: AdvanceAccountStatus;
    custodian_name?: string | null;
    branch_name?: string | null;
}

export type AdvanceAccountListResponse =
    TreasuryListResponse<AdvanceAccountListItem>;
export type AdvanceAccountFilters = TreasuryListFilters;

export interface AdvanceAccountIndexProps extends SharedData {
    advance_accounts: AdvanceAccountListResponse;
    filters: AdvanceAccountFilters;
}
