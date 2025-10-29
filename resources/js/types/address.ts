import { Customer } from './customer';

export interface Address {
    id: number;
    customer_id: number; // Foreign key reference to Customer

    line1: string;
    line2?: string | null;
    division: string;
    district: string;
    upazila?: string | null;
    union_ward?: string | null;
    village_locality?: string | null;
    postal_code?: string | null;
    country_code: string; // Default 'BD'

    type: 'CURRENT' | 'PERMANENT' | 'MAILING' | 'WORK' | 'REGISTERED' | 'OTHER';

    created_at: string;
    updated_at: string;
}

export interface AddressWithCustomer extends Address {
    customer?: Customer; // Optional nested relation
}
