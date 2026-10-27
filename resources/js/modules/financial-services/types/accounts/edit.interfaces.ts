import type { SharedData } from '@/types';

export interface Props extends SharedData {
    product: 'savings' | 'share' | 'fixed' | 'recurring' | 'loan';
    account: {
        id: number;
        account_no: string;
        name?: string | null;
        account_type: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
    };
}
