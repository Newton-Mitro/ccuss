import type { SharedData } from '@/types';
import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/types/treasury-cash/common';

export type BankAccountType = 'CURRENT' | 'SAVINGS' | 'FDR' | 'OTHER';
export type BankAccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface BankAccountListItem {
    id: number;
    account_name: string;
    account_number: string;
    routing_number?: string | null;
    account_type: BankAccountType;
    opening_balance: string | number;
    is_reconcilable: boolean;
    status: BankAccountStatus;
    bank?: { name: string; code: string } | null;
    branch?: { name: string; code: string } | null;
}

export type BankAccountListResponse = TreasuryListResponse<BankAccountListItem>;
export type BankAccountFilters = TreasuryListFilters;

export interface BankAccountIndexProps extends SharedData {
    accounts: BankAccountListResponse;
    filters: BankAccountFilters;
}
