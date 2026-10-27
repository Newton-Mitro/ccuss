import type { SharedData } from '@/types';

export interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        balance: string | number;
        status: string;
        account_type?: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        fixed_deposit?: {
            principal_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            started_at?: string;
            maturity_date?: string;
            maturity_amount?: string | number;
            maturity_instruction?: string;
        } | null;
    };
}
