import type { SharedData } from '@/types';

export interface Props extends SharedData {
    accounts: {
        data: Array<{
            id: number;
            account_no: string;
            balance: string | number;
            status: string;
            holder?: { name?: string } | null;
            recurring_deposit?: {
                installment_amount?: string | number;
                installment_frequency?: string;
                total_installments?: number;
                paid_installments?: number;
                maturity_date?: string;
            } | null;
        }>;
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: number };
}
