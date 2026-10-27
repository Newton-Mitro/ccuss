import type { SharedData } from '@/types';

export interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        status?: string;
        name?: string;
        product?: { code?: string; name?: string } | null;
        holder?: { name?: string } | null;
        saving_account?: {
            minimum_balance?: string | number;
        } | null;
    };
}
