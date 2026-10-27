import type { BankAccountType } from '@/modules/treasury-cash/types/bank-accounts';

export interface BankAccountDetails {
    id: number;
    account_name: string;
    account_number: string;
    routing_number?: string | null;
    account_type: BankAccountType;
    balance: string | number;
    opening_balance: string | number;
    is_reconcilable: boolean;
    status: string;
    branch?: { name: string } | null;
    financial_account?: { account_no: string; name: string } | null;
}
