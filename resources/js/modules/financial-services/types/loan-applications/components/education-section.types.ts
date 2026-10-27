import { EducationDetail } from '@/modules/financial-services/loan-applications/types';

export type Props = {
    rows: EducationDetail[];
    onChange: (rows: EducationDetail[]) => void;
};
