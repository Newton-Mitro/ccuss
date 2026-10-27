import type { SharedData } from '@/types';

export interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        balance: string | number;
        status: string;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        share_account?: {
            id: number;
            membership_no?: string;
            member_since?: string;
            membership_status?: string;
            total_shares?: string | number;
            share_value?: string | number;
        } | null;
    };
}
