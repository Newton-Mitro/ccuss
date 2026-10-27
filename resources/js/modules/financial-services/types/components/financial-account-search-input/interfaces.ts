import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { FinancialAccountSearchScope } from '@/modules/financial-services/types/components/financial-account-search-input/types';

export interface FinancialAccountSearchResult {
    id: number;
    account_no: string;
    name: string | null;
    account_type: string;
    status: string;
    balance: number;
    available_balance: number;
    holder: Customer | null;
    holders: Array<{
        id: number;
        name: string;
        customer_no: string;
        type: string;
    }>;
}

export interface FinancialAccountSearchInputProps {
    onSelect: (account: FinancialAccountSearchResult) => void;
    clearSelectedAccount?: () => void;
    initialAccount?: FinancialAccountSearchResult | null;
    scope?: FinancialAccountSearchScope;
    excludeAccountIds?: number[];
    placeholder?: string;
}
