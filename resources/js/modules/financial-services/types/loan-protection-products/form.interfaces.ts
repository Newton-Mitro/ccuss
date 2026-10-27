import type { LoanProtectionProduct } from '@/modules/financial-services/types/financial-services';
import type { SharedData } from '@/types';

export interface FormPageProps extends SharedData {
    product: LoanProtectionProduct | null;
    can_manage: boolean;
}
