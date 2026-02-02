import { Media } from './media';

export interface Customer {
    id: number;

    customer_no: string; // Unique customer number
    type: 'Individual' | 'Organization' | string; // Customer type
    name: string;
    phone?: string | null;
    email?: string | null;
    kyc_level: 'MIN' | 'STD' | 'ENH' | string; // KYC level
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | string; // Current customer status

    // Personal info
    dob?: string | null; // Date in ISO format (YYYY-MM-DD)
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
    religion?:
        | 'CHRISTIANITY'
        | 'ISLAM'
        | 'HINDUISM'
        | 'BUDDHISM'
        | 'OTHER'
        | string;

    identification_type:
        | 'NID'
        | 'BRN'
        | 'PASSPORT'
        | 'DRIVING_LICENSE'
        | string;
    identification_number: string;
    photo_id?: number | null; // Foreign key to media table
    photo?: Media | null;

    // Organization info
    registration_no?: string | null;

    created_at: string;
    updated_at: string;
}
