import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type CashTransferStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface CashTransferListItem {
    id: number;
    transfer_no: string;
    amount: string | number;
    status: CashTransferStatus;
    note?: string | null;
    requested_at?: string | null;
    branch_day?: { business_date: string } | null;
    from_cash_location?: { code: string; name: string } | null;
    to_cash_location?: { code: string; name: string } | null;
}

export type CashTransferListResponse =
    TreasuryListResponse<CashTransferListItem>;
export type CashTransferFilters = TreasuryListFilters;

export interface CashTransferIndexProps extends SharedData {
    transfers: CashTransferListResponse;
    filters: CashTransferFilters;
}
