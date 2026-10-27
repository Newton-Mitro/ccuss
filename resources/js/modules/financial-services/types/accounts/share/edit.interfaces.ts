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
        share_account?: {
            membership_no?: string;
            membership_status?: string;
            member_since?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
