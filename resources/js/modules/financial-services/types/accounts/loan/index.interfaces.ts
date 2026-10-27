import type { SharedData } from '@/types';

export interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            balance: string | number;
            status: string;
            holder?: { name?: string } | null;
            loan_account?: {
                loan_no?: string;
                principal_amount?: string | number;
                disbursed_amount?: string | number;
                status?: string;
                maturity_date?: string;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
