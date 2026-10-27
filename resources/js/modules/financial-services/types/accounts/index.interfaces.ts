import { SharedData } from '@/types';

export interface Account {
    id: number;
    account_no: string;
    name?: string;
    account_type: string;
    status: string;
    balance: string | number;
    holder?: { name?: string } | null;
    product?: { name?: string } | null;
}

export interface Props extends SharedData {
    accounts: {
        data: Account[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string };
    category?: string | null;
}
