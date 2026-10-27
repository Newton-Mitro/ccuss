import { AssetDetail } from '@/modules/financial-services/loan-applications/types';

export type Props = {
    rows: AssetDetail[];
    onChange: (rows: AssetDetail[]) => void;
};
