import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type TellerCashTransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TellerCashTransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED';

export interface TellerCashTransactionListItem {
    id: number;
    transaction_no: string;
    type: TellerCashTransactionType;
    amount: string | number;
    status: TellerCashTransactionStatus;
    reference?: string | null;
    requested_at?: string | null;
    teller_session?: {
        teller?: { code: string; name: string } | null;
    } | null;
    branch_day?: { business_date: string } | null;
}

export type TellerCashTransactionListResponse =
    TreasuryListResponse<TellerCashTransactionListItem>;
export type TellerCashTransactionFilters = TreasuryListFilters;

export interface TellerCashTransactionIndexProps extends SharedData {
    transactions: TellerCashTransactionListResponse;
    filters: TellerCashTransactionFilters;
}
