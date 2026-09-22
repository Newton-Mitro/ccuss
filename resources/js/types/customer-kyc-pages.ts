import type { SharedData } from '@/types';
import type { Customer } from '@/types/customer_kyc_module';

export interface CustomerPageProps extends SharedData {
    customer: Customer;
}
