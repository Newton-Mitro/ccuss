import { Customer } from './customer';

export interface OnlineClient {
    id: number;

    customer_id: number; // FK → customers.id
    customer?: Customer;

    username: string;
    email?: string | null;
    phone?: string | null;
    password: string;

    last_login_at?: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

    created_at: string;
    updated_at: string;
}
