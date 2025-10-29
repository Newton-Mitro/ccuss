import { Media } from './media';

export interface Customer {
    id: number;

    customer_no: string; // Unique customer number
    type: 'Individual' | 'Organization'; // Customer type
    name: string;
    phone?: string | null;
    email?: string | null;
    kyc_level: 'MIN' | 'STD' | 'ENH'; // KYC level
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED'; // Current customer status

    // Personal info
    dob?: string | null; // Date in ISO format (YYYY-MM-DD)
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    religion?:
        | 'CHRISTIANITY'
        | 'ISLAM'
        | 'HINDUISM'
        | 'BUDDHISM'
        | 'OTHER'
        | null;

    identification_type: 'NID' | 'NBR' | 'PASSPORT' | 'DRIVING_LICENSE';
    identification_number: string;
    photo_id?: number | null; // Foreign key to media table
    photo_media?: Media | null;

    // Organization info
    registration_no?: string | null;

    created_at: string;
    updated_at: string;
}
