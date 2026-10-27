import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/modules/treasury-cash/types/treasury-cash/common';
import type { SharedData } from '@/types';

export type TellerCashTransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TellerCashTransactionStatus =
    | 'PENDING'
    | 'POSTED'
    | 'CANCELLED'
    | 'REVERSED';

export interface TellerCashTransactionListItem {
    id: number;
    transaction_no: string;
    type: TellerCashTransactionType;
    amount: string | number;
    status: TellerCashTransactionStatus;
    reference?: string | null;
    note?: string | null;
    requested_at?: string | null;
    posted_at?: string | null;
    cancelled_at?: string | null;
    cancelled_by?: number | null;
    cancellation_reason?: string | null;
    reversed_at?: string | null;
    reversed_by?: number | null;
    reversal_reason?: string | null;
    financial_transaction?: {
        id: number;
        transaction_no: string;
        transaction_type: string;
        transaction_date: string;
        amount: string | number;
        status: string;
        reference?: string | null;
        entries: {
            id: number;
            direction: string;
            amount: string | number;
            description?: string | null;
            financial_account?: {
                account_no: string;
                name?: string | null;
            } | null;
        }[];
    } | null;
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
