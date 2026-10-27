import { SharedData } from '@/types';

export interface FiscalPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'OPEN' | 'CLOSED';
    draft_vouchers_count: number;
    fiscal_year?: { name: string };
}

export interface Props extends SharedData {
    operation: 'close' | 'reopen';
    fiscalPeriods: {
        data: FiscalPeriod[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}
