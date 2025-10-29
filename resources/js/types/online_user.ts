import { Customer } from './customer';

export interface OnlineUser {
    id: number;

    customer_id: number; // FK → customers.id

    username: string;
    email?: string | null;
    phone?: string | null;
    password: string;

    last_login_at?: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

    created_at: string;
    updated_at: string;
}

export interface OnlineUserWithCustomer extends OnlineUser {
    customer?: Customer;
}
