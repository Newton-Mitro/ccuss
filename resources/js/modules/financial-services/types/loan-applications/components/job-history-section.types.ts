import { JobHistory } from '@/modules/financial-services/loan-applications/types';

export type Props = {
    rows: JobHistory[];
    onChange: (rows: JobHistory[]) => void;
};
