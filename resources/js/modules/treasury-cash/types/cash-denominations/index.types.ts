import type { SharedData } from '@/types';

export type Denomination = {
    id: number;
    currency: string;
    type: 'NOTE' | 'COIN';
    value: string | number;
    name?: string | null;
    is_active: boolean;
    count_lines_count: number;
};

export type Props = SharedData & {
    denominations: Denomination[];
};
