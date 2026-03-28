// types/organization.ts

export interface Organization {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
    registration_no?: string | null;
    tax_id?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    logo_url?: string | null;
    report_header_line1?: string | null;
    report_header_line2?: string | null;
    report_footer?: string | null;
    created_at: string;
    updated_at: string;
}
