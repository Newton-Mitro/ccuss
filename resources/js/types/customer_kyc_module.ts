import { Audit } from './audit_models';
import { ID, Timestamp, Timestamped } from './base_types';

/* ===========================
 * Enums / Types
 * =========================== */
export type CustomerType = 'individual' | 'organization';
export type Gender = 'male' | 'female' | 'other';
export type Religion =
    | 'christianity'
    | 'islam'
    | 'hinduism'
    | 'buddhism'
    | 'other';
export type IdentificationType =
    | 'national_identification_number'
    | 'birth_registration_number'
    | 'registration_no'
    | 'passport'
    | 'driving_license';
export type AddressType =
    | 'current'
    | 'permanent'
    | 'mailing'
    | 'work'
    | 'registered'
    | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type KycLevel = 'basic' | 'full' | 'enhanced';
export type CustomerStatus =
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'closed';

/* ===========================
 * Customer
 * =========================== */
export interface Customer extends Timestamped {
    id: ID;
    customer_no: string;
    type: CustomerType;

    // Common fields
    name: string;
    primary_phone?: string | null;
    alternate_phone?: string | null;
    primary_email?: string | null;
    alternate_email?: string | null;

    // Individual-only fields
    dob?: string | null;
    gender?: Gender | null;
    religion?: Religion | null;
    marital_status?: string | null;
    blood_group?: string | null;
    nationality?: string | null;
    occupation?: string | null;
    education?: string | null;

    // Identification
    identification_type: IdentificationType;
    identification_number: string;

    status: CustomerStatus;

    // Files
    photo?: KycDocument | null;
    signature?: KycDocument | null;

    // Relations
    addresses?: CustomerAddress[];
    family_relations?: CustomerFamilyRelation[];
    related_to_me?: CustomerFamilyRelation[];
    introducers?: CustomerIntroducer[];
    kyc_profile?: KycProfile | null;
    kyc_documents?: KycDocument[];
    audits?: Audit[];
}

/* ===========================
 * KYC Documents
 * =========================== */
export interface KycDocument extends Timestamped {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    document_type: string;
    file_name: string;
    file_path: string;
    file_type: string;
    alt_text?: string | null;
    url: string;

    verification_status: VerificationStatus;
    verified_at?: Timestamp | null;
    remarks?: string | null;
    audits?: Audit[];
}

/* ===========================
 * Customer Addresses
 * =========================== */
export interface CustomerAddress extends Timestamped {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    line1: string;
    line2?: string | null;
    division?: string | null;
    district?: string | null;
    upazila?: string | null;
    union_ward?: string | null;
    postal_code?: string | null;
    country: string;

    type: AddressType;

    verification_status: VerificationStatus;
    verified_at?: Timestamp | null;
    remarks?: string | null;
    audits?: Audit[];
}

/* ===========================
 * Customer Family Relations
 * =========================== */
export type RelationType =
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'brother'
    | 'sister'
    | 'husband'
    | 'wife'
    | 'grandfather'
    | 'grandmother'
    | 'uncle'
    | 'aunt'
    | 'nephew'
    | 'niece'
    | 'father_in_law'
    | 'mother_in_law'
    | 'son_in_law'
    | 'daughter_in_law'
    | 'brother_in_law'
    | 'sister_in_law';

export interface CustomerFamilyRelation extends Timestamped {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    relative_id?: ID | null;
    relative?: Customer | null;

    relation_type: RelationType;

    verification_status: VerificationStatus;
    verified_at?: Timestamp | null;
    remarks?: string | null;
    audits?: Audit[];
}

/* ===========================
 * Customer Introducers
 * =========================== */
export type IntroducerRelationshipType =
    | 'family'
    | 'friend'
    | 'business'
    | 'colleague'
    | 'other';

export interface CustomerIntroducer extends Timestamped {
    id: ID;

    introduced_customer_id: ID;
    introduced_customer?: Customer | null;

    introducer_customer_id: ID;
    introducer_customer?: Customer | null;

    introducer_account_id?: ID | null;

    relationship_type: IntroducerRelationshipType;

    verification_status: VerificationStatus;
    verified_at?: Timestamp | null;
    remarks?: string | null;
    audits?: Audit[];
}

/* ===========================
 * KYC Profile
 * =========================== */
export interface KycProfile extends Timestamped {
    id: ID;
    customer_id: ID;
    verification_value: number;
    customer?: Customer | null;
    kyc_level: KycLevel;
    audits?: Audit[];
}
