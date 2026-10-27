import type { SharedData } from '@/types';

export interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        name?: string;
        balance: string | number;
        available_balance: string | number;
        status: string;
        opened_at?: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        saving_account?: { minimum_balance?: string | number } | null;
    };
}
