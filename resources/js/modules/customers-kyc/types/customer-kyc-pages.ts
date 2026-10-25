import type { SharedData } from '@/types';
import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';

export interface CustomerPageProps extends SharedData {
    customer: Customer;
}
