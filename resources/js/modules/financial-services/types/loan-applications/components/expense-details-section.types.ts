import { ExpenseDetail } from '@/modules/financial-services/loan-applications/types';

export type Props = {
    rows: ExpenseDetail[];
    onChange: (rows: ExpenseDetail[]) => void;
};
