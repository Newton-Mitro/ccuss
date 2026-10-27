import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { SharedData } from '@/types';

export interface Props extends SharedData {
    customer: Customer;
}
