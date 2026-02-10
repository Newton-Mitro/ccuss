import { AuditFields, ID, Timestamp } from './base_types';
import { User } from './user';

export type AddressVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type FamilyVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CustomerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type CustomerType = 'Individual' | 'Organization';
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
export type KycLevel = 'MIN' | 'STD' | 'ENH';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

/* ===========================
 * Customer
 * =========================== */

export interface Customer extends AuditFields {
    id: ID;
    customer_no: string;
    type: CustomerType;

    name: string;
    phone?: string | null;
    email?: string | null;
    dob?: string | null;

    gender?: Gender | null;
    religion?: Religion | null;

    identification_type: IdentificationType;
    identification_number: string;

    kyc_level: KycLevel;
    kyc_status: KycStatus;

    kyc_verified_by?: ID | null;
    kyc_verified_at?: Timestamp | null;

    photo?: CustomerPhoto | null;

    status: CustomerStatus;
}

export interface CustomerPhoto extends AuditFields {
    id: number;
    customer_id: ID;
    customer?: Customer | null;
    file_name: string;
    file_path: string;
    file_type: string;
    alt_text?: string | null;
    url: string;
}

/* ===========================
 * Customer Addresses
 * =========================== */

export type AddressType =
    | 'CURRENT'
    | 'PERMANENT'
    | 'MAILING'
    | 'WORK'
    | 'REGISTERED'
    | 'OTHER';

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

    verification_status: AddressVerificationStatus;
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

    // Linked customer (optional)
    relative_id?: ID | null;

    // Raw identity (used when relative_id is null)
    name: string;
    phone?: string | null;
    email?: string | null;
    dob?: string | null;

    gender?: Gender | null;
    religion?: Religion | null;

    identification_type: Exclude<IdentificationType, 'REGISTRATION_NO'>;
    identification_number: string;

    photo?: FamilyRelationPhoto | null;

    relation_type: RelationType;

    verification_status: FamilyVerificationStatus;
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
}

export interface FamilyRelationPhoto extends AuditFields {
    id: number;
    customer_id: ID;
    customer?: Customer | null;
    file_name: string;
    file_path: string;
    file_type: string;
    alt_text?: string | null;
    url: string;
}

/* ===========================
 * Customer Signatures
 * =========================== */

export interface CustomerSignature extends AuditFields {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;
    file_name: string;
    file_path: string;
    mime: string;
    alt_text?: string | null;
    url?: string | null;
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
    introducer_customer?: Customer | null;
    introducer_account_id: ID;

    relationship_type: IntroducerRelationshipType;

    verification_status: AddressVerificationStatus;
    verified_by?: ID | null;
    verified_by_user?: User | null;
    verified_at?: Timestamp | null;
    remarks?: string | null;
}

/* ===========================
 * Online Service Users
 * =========================== */

export interface OnlineServiceUser extends AuditFields {
    id: ID;
    customer_id: ID;
    customer?: Customer | null;

    username: string;
    email?: string | null;
    phone?: string | null;

    password: string; // hashed
    last_login_at?: Timestamp | null;

    status: Exclude<CustomerStatus, 'PENDING'>;
}
