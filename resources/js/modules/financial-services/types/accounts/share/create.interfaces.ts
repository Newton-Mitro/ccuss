import type { SharedData } from '@/types';

export interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
    }>;
    customers: Array<{
        id: number;
        customer_no: string;
        name: string;
    }>;
}
