export interface Customer {
    id: number;
    customer_no: string;
    name: string;
    primary_phone?: string | null;
}

export interface Holder {
    id: number;
    name?: string;
    customer_no?: string;
    pivot?: { role?: string; ownership_percent?: string | number };
}

export interface Nominee {
    id: number;
    customer_id?: number | null;
    name: string;
    relationship: string;
    phone?: string | null;
    share_percent?: string | number;
    is_primary?: boolean;
}

export interface AuthorizedPerson {
    id: number;
    customer?: { id?: number; name?: string; customer_no?: string } | null;
    authorization_type: string;
    designation?: string | null;
    transaction_limit?: string | number | null;
    effective_from?: string | null;
    effective_to?: string | null;
    is_active?: boolean;
    note?: string | null;
}
