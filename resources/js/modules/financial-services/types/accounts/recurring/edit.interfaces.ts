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
        recurring_deposit?: {
            installment_amount?: string | number;
            installment_frequency?: string;
            total_installments?: number;
            started_at?: string;
            maturity_extension_days?: number;
            grace_days?: number;
            maturity_date?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
