export interface Introducer {
    id: number;
    introduced_customer_id: number; // Customer who is being introduced
    introducer_customer_id: number; // Customer who acts as introducer
    introducer_name: string; // Optional: display name of introducer
    introducer_account_id: number; // Linked deposit account
    relationship_type: 'FAMILY' | 'FRIEND' | 'BUSINESS' | 'COLLEAGUE' | 'OTHER';
    verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    verified_by?: number; // Bank officer ID
    verified_by_name?: string; // Bank officer display name (optional)
    verified_at?: string | null; // Timestamp of verification
    remarks?: string | null;
    created_by?: number | null;
    updated_by?: number | null;
    created_at?: string;
    updated_at?: string;
}
