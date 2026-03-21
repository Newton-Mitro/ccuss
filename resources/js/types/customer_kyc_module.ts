import { AuditFields, ID, Timestamp } from './base_types';
import { User } from './user';

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
    | 'NID'
    | 'BRN'
    | 'REGISTRATION_NO'
    | 'PASSPORT'
    | 'DRIVING_LICENSE';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AddressType =
    | 'CURRENT'
    | 'PERMANENT'
    | 'MAILING'
    | 'WORK'
    | 'REGISTERED'
    | 'OTHER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type KycLevel = 'BASIC' | 'FULL' | 'ENHANCED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/* ===========================
 * Customer
 * =========================== */
export interface Customer extends AuditFields {
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
    introducers?: CustomerIntroducer[];
    introduced_customers?: CustomerIntroducer[];
    online_service_client?: User | null;
    kyc_profile?: KycProfile | null;
    kyc_documents?: KycDocument[];
}

/* ===========================
 * KYC Documents
 * =========================== */
export interface KycDocument extends AuditFields {
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
export interface CustomerAddress extends AuditFields {
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

export interface CustomerFamilyRelation extends AuditFields {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    relative_id?: ID | null;
    relative?: Customer | null;

    relation_type: RelationType;

    verification_status: VerificationStatus;
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
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

export interface CustomerIntroducer extends AuditFields {
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
export interface KycProfile extends AuditFields {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    kyc_level: KycLevel;
    risk_level: RiskLevel;

    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
}
