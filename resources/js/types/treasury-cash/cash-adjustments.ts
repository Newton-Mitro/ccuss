import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type CashAdjustmentType = 'SHORTAGE' | 'EXCESS';
export type CashAdjustmentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'POSTED'
    | 'CANCELLED';

export interface CashAdjustmentListItem {
    id: number;
    amount: string | number;
    type: CashAdjustmentType;
    reason: string;
    status: CashAdjustmentStatus;
    requested_at?: string | null;
    branch_day?: { business_date: string } | null;
    teller_session?: {
        teller?: { code: string; name: string } | null;
    } | null;
}

export type CashAdjustmentListResponse =
    TreasuryListResponse<CashAdjustmentListItem>;
export type CashAdjustmentFilters = TreasuryListFilters;

export interface CashAdjustmentIndexProps extends SharedData {
    adjustments: CashAdjustmentListResponse;
    filters: CashAdjustmentFilters;
}
