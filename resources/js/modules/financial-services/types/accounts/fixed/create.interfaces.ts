import type { FinancialProductTermOption } from '@/modules/financial-services/types/financial-services';
import type { SharedData } from '@/types';

export interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        base_interest_rate?: string | number | null;
        terms: FinancialProductTermOption[];
    }>;
    customers: Array<{
        id: number;
        customer_no: string;
        name: string;
        type: 'INDIVIDUAL' | 'ORGANIZATION';
        dob?: string | null;
    }>;
}
