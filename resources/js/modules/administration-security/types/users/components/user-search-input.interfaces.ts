import { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';

export interface CustomerSearchInputProps {
    onSelect: (customer: Customer) => void;
    label?: string;
    placeholder?: string; // <-- new prop
}
