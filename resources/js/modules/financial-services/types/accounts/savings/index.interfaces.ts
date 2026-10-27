import type { SharedData } from '@/types';

export interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            balance: string | number;
            status: string;
            opened_at?: string | null;
            holder?: { name?: string } | null;
            saving_account?: { minimum_balance?: string | number } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
