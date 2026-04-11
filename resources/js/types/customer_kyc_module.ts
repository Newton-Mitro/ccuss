import { Audit } from './audit_models';
import { ID, Timestamp, Timestamped } from './base_types';
import { User } from './user';

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
    | 'nid'
    | 'brn'
    | 'registration_no'
    | 'passport'
    | 'driving_license';
export type KycStatus = 'pending' | 'verified' | 'rejected';
export type AddressType =
    | 'current'
    | 'permanent'
    | 'mailing'
    | 'work'
    | 'registered'
    | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type KycLevel = 'basic' | 'full' | 'enhanced';
export type RiskLevel = 'low' | 'medium' | 'high';

/* ===========================
 * Customer
 * =========================== */
export interface Customer extends Timestamped {
    id: ID;
    customer_no: string;
    type: CustomerType;

    // Common fields
    name: string;
    phone?: string | null;
    email?: string | null;

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

    // KYC
    kyc_status: KycStatus;
    kyc_verified_by?: ID | null;
    kyc_verified_by_user?: User | null;
    kyc_verified_at?: Timestamp | null;

    // Files
    photo?: KycDocument | null;
    signature?: KycDocument | null;

    // Relations
    addresses?: CustomerAddress[];
    family_relations?: CustomerFamilyRelation[];
    related_to_me?: CustomerFamilyRelation[];
    introducers?: CustomerIntroducer[];
    introduced_customers?: CustomerIntroducer[];
    online_service_client?: User | null;
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
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
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
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
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
    verified_by?: ID | null;
    verifier?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
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
    introducer?: Customer | null;

    introducer_account_id?: ID | null;

    relationship_type: IntroducerRelationshipType;

    verification_status: VerificationStatus;
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
}

/* ===========================
 * KYC Profile
 * =========================== */
export interface KycProfile extends Timestamped {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    kyc_level: KycLevel;
    risk_level: RiskLevel;

    verification_status: 'pending' | 'approved' | 'rejected';
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
}
