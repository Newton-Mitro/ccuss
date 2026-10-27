import type { CustomerAddress } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { SharedData } from '@/types';

export interface Props extends SharedData {
    address: CustomerAddress;
}

export interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
}
