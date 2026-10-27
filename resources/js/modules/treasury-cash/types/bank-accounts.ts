import type {
    TreasuryListFilters,
    TreasuryListResponse,
} from '@/modules/treasury-cash/types/common';
import type { SharedData } from '@/types';

export type BankAccountType = 'CURRENT' | 'SAVINGS' | 'FDR' | 'OTHER';
export type BankAccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface BankAccountListItem {
    id: number;
    account_name: string;
    account_number: string;
    routing_number?: string | null;
    account_type: BankAccountType;
    balance: string | number;
    opening_balance: string | number;
    is_reconcilable: boolean;
    status: BankAccountStatus;
    branch?: { name: string; code: string } | null;
}

export type BankAccountListResponse = TreasuryListResponse<BankAccountListItem>;
export type BankAccountFilters = TreasuryListFilters;

export interface BankAccountIndexProps extends SharedData {
    accounts: BankAccountListResponse;
    filters: BankAccountFilters;
}
