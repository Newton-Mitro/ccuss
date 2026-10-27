import { type CostCenter } from '@/modules/general-accounting/cost-centers/cost-center-dialog';
import { SharedData } from '@/types';

export interface Props extends SharedData {
    costCenters: {
        data: CostCenter[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page?: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}
