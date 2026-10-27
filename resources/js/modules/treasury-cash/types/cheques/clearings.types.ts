import type { SharedData } from '@/types';

export type Clearing = {
    id: number;
    clearing_no: string;
    amount: string | number;
    clearing_date: string;
    status: string;
    cheque?: {
        cheque_no?: string;
        payee?: string | null;
    };
};

export type Props = SharedData & {
    clearings: {
        data: Clearing[];
    };
};
