import { User } from './user';

export interface Vendor {
    id: number;
    name: string;
    short_name?: string;
    code?: string;
    email?: string;
    phone?: string;
    website?: string;
    status: 'active' | 'INACTIVE';
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;

    createdBy?: User;
    updatedBy?: User;
    addresses?: VendorAddress[];
    contacts?: VendorContact[];
    categories?: VendorCategory[];
    transactions?: VendorTransaction[];
}

export interface VendorAddress {
    id: number;
    vendor_id: number;
    address_type: 'HEAD_OFFICE' | 'BRANCH' | 'WAREHOUSE';
    line_1: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    created_at: string;
    updated_at: string;

    vendor?: Vendor;
}

export interface VendorContact {
    id: number;
    vendor_id: number;
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
    contact_type: 'primary' | 'SECONDARY' | 'ACCOUNTING' | 'LOGISTICS';
    created_at: string;
    updated_at: string;

    vendor?: Vendor;
}

export interface VendorCategory {
    id: number;
    name: string;
    code: string;
    description?: string;
    created_at: string;
    updated_at: string;

    vendors?: Vendor[];
}

export interface VendorCategoryAssignment {
    id: number;
    vendor_id: number;
    vendor_category_id: number;
    created_at: string;
    updated_at: string;

    vendor?: Vendor;
    category?: VendorCategory;
}

export interface VendorTransaction {
    id: number;
    vendor_id: number;
    transaction_no: string;
    type: 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE';
    debit: number;
    credit: number;
    balance_after?: number;
    transaction_date: string;
    remarks?: string;
    created_by?: number;
    created_at: string;
    updated_at: string;

    vendor?: Vendor;
    creator?: User;
}
