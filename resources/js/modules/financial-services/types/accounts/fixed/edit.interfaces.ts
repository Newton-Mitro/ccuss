import type { SharedData } from '@/types';

export interface Props extends SharedData {
    canManageProductDetails: boolean;
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        status?: string;
        name?: string;
        product?: { code?: string; name?: string } | null;
        fixed_deposit?: {
            principal_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            started_at?: string;
            maturity_date?: string;
            maturity_instruction?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
