import type { FinancialProductTermOption } from '@/modules/financial-services/types/financial-services';
import type { SharedData } from '@/types';

export interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        terms: FinancialProductTermOption[];
    }>;
}
