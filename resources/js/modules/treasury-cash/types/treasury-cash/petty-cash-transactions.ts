import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/modules/treasury-cash/types/treasury-cash/common';
import type { SharedData } from '@/types';

export type PettyCashTransactionType =
    | 'FUNDING'
    | 'EXPENSE'
    | 'REPLENISHMENT'
    | 'RETURN'
    | 'ADJUSTMENT';

export type PettyCashTransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED';

export interface PettyCashTransactionListItem {
    id: number;
    transaction_no: string;
    type: PettyCashTransactionType;
    amount: string | number;
    status: PettyCashTransactionStatus;
    payee?: string | null;
    description?: string | null;
    branch_day?: { business_date: string } | null;
    petty_cash_fund?: { code: string; name: string } | null;
}

export type PettyCashTransactionListResponse =
    TreasuryListResponse<PettyCashTransactionListItem>;
export type PettyCashTransactionFilters = TreasuryListFilters;

export interface PettyCashTransactionIndexProps extends SharedData {
    transactions: PettyCashTransactionListResponse;
    filters: PettyCashTransactionFilters;
}
