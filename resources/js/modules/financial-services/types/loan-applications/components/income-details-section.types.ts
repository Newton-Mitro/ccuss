import { IncomeDetail } from '@/modules/financial-services/loan-applications/types';

export type Props = {
    rows: IncomeDetail[];
    onChange: (rows: IncomeDetail[]) => void;
};
