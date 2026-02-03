export interface FamilyRelation {
    id: number;
    customer_id: number; // The main customer
    relative_id?: number | null; // Optional link to another customer
    name: string; // Relative's name (if not a customer)
    phone?: string | null;
    email?: string | null;
    dob?: string | null; // Date of birth
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    religion?:
        | 'CHRISTIANITY'
        | 'ISLAM'
        | 'HINDUISM'
        | 'BUDDHISM'
        | 'OTHER'
        | null;
    identification_type: 'NID' | 'BRN' | 'PASSPORT' | 'DRIVING_LICENSE';
    identification_number: string;
    photo?: string | null; // URL or file path
    relation_type:
        | 'FATHER'
        | 'MOTHER'
        | 'SON'
        | 'DAUGHTER'
        | 'BROTHER'
        | 'COUSIN_BROTHER'
        | 'COUSIN_SISTER'
        | 'SISTER'
        | 'HUSBAND'
        | 'WIFE'
        | 'GRANDFATHER'
        | 'GRANDMOTHER'
        | 'GRANDSON'
        | 'GRANDDAUGHTER'
        | 'UNCLE'
        | 'AUNT'
        | 'NEPHEW'
        | 'NIECE'
        | 'FATHER-IN-LAW'
        | 'MOTHER-IN-LAW'
        | 'SON-IN-LAW'
        | 'DAUGHTER-IN-LAW'
        | 'BROTHER-IN-LAW'
        | 'SISTER-IN-LAW';
    reverse_relation_type: string; // Reverse relation (optional: could match relation_type enum)
    created_by?: number | null;
    updated_by?: number | null;
    created_at?: string;
    updated_at?: string;
}
