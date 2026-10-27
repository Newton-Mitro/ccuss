import { SharedData } from '@/types';

export interface TreasuryGlMapping {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account: { code: string; name: string };
    credit_account: { code: string; name: string };
}

export interface Props extends SharedData {
    mappings: {
        data: TreasuryGlMapping[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}
