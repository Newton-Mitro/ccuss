import { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';

export interface CustomerSearchBoxProps {
    onSelect: (customer: Customer) => void;
    label?: string;
    selectedCustomer?: Customer;
    placeholder?: string;
}
