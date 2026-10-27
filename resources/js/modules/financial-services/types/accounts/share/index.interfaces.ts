import type { SharedData } from '@/types';

export interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            status: string;
            holder?: { name?: string } | null;
            share_account?: {
                membership_no?: string;
                membership_status?: string;
                member_since?: string | null;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
