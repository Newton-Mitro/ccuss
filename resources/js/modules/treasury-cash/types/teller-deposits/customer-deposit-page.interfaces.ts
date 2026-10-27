import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import { type FinancialAccountSearchResult } from '@/modules/financial-services/components/financial-account-search-input';

export interface CustomerAccount {
    id: number;
    account_type: string;
    account_no: string;
    name: string | null;
    balance: number;
    available_balance: number;
    last_deposit_date: string | null;
}

export interface ObligationsRow {
    id: string;
    account_id: number;
    account_type: string;
    account_name: string | null;
    account_no: string;
    due_type: string;
    month: string;
    amount: number;
}

export interface TellerSessionOption {
    id: number;
    teller?: { name: string; code: string } | null;
    branch_day?: { business_date: string } | null;
    opening_cash?: string | number;
    expected_cash?: string | number | null;
}

export interface CustomerDepositPageProps extends Record<string, unknown> {
    customer: Customer | null;
    selectedAccount: FinancialAccountSearchResult | null;
    customerAccounts: CustomerAccount[];
    obligations: ObligationsRow[];
    totals: {
        current_due: number;
        previous_due: number;
        total_due: number;
    };
    teller_sessions: TellerSessionOption[];
    filters: { customer_id?: string };
}
