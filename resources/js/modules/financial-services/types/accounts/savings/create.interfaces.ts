import type { SharedData } from '@/types';

export interface Props extends SharedData {
    products: Array<{
        id: number;
        code: string;
        name: string;
        policy?: {
            minimum_opening_amount?: string | number;
        } | null;
    }>;
}
