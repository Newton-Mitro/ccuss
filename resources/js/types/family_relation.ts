export interface FamilyRelation {
    id: number;
    customer_id: number; // Foreign key -> customers.id
    relative_id: number; // Foreign key -> customers.id

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

    reverse_relation_type:
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

    created_at: string;
    updated_at: string;
}
