import type { SharedData } from '@/types';

export interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            balance: string | number;
            status: string;
            holder?: { name?: string } | null;
            fixed_deposit?: {
                principal_amount?: string | number;
                maturity_date?: string;
                maturity_amount?: string | number;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
