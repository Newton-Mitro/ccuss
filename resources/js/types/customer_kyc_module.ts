import { Audit } from './audit_models';
import { ID, Timestamp, Timestamped } from './base_types';

/* ===========================
 * Enums / Types
 * =========================== */
export type CustomerType = 'INDIVIDUAL' | 'ORGANIZATION';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Religion =
    | 'CHRISTIANITY'
    | 'ISLAM'
    | 'HINDUISM'
    | 'BUDDHISM'
    | 'OTHER';
export type IdentificationType =
    | 'NATIONAL_IDENTIFICATION_NUMBER'
    | 'BIRTH_REGISTRATION_NUMBER'
    | 'REGISTRATION_NO'
    | 'PASSPORT'
    | 'DRIVING_LICENSE';
export type AddressType =
    | 'CURRENT'
    | 'PERMANENT'
    | 'MAILING'
    | 'WORK'
    | 'REGISTERED'
    | 'OTHER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type KycLevel = 'MINIMAL' | 'BASIC' | 'STANDARD' | 'FULL' | 'ENHANCED';
export type CustomerStatus =
    | 'PENDING'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'CLOSED';

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
    | 'FATHER'
    | 'MOTHER'
    | 'SON'
    | 'DAUGHTER'
    | 'BROTHER'
    | 'SISTER'
    | 'HUSBAND'
    | 'WIFE'
    | 'GRANDFATHER'
    | 'GRANDMOTHER'
    | 'UNCLE'
    | 'AUNT'
    | 'NEPHEW'
    | 'NIECE'
    | 'FATHER_IN_LAW'
    | 'MOTHER_IN_LAW'
    | 'SON_IN_LAW'
    | 'DAUGHTER_IN_LAW'
    | 'BROTHER_IN_LAW'
    | 'SISTER_IN_LAW';

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
    | 'FAMILY'
    | 'FRIEND'
    | 'BUSINESS'
    | 'COLLEAGUE'
    | 'OTHER';

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
