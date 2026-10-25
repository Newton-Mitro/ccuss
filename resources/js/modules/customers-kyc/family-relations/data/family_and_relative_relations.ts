export const maleFemaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Mother', value: 'MOTHER' },
    { label: 'Daughter', value: 'DAUGHTER' },
    { label: 'Sister', value: 'SISTER' },
    { label: 'Wife', value: 'WIFE' },
    { label: 'Grandmother', value: 'GRANDMOTHER' },
    { label: 'Aunt', value: 'AUNT' },
    { label: 'Niece', value: 'NIECE' },
    { label: 'Mother In Law', value: 'MOTHER_IN_LAW' },
    { label: 'Daughter In Law', value: 'DAUGHTER_IN_LAW' },
    { label: 'Sister In Law', value: 'SISTER_IN_LAW' },
];

export const femaleMaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Father', value: 'FATHER' },
    { label: 'Son', value: 'SON' },
    { label: 'Brother', value: 'BROTHER' },
    { label: 'Husband', value: 'HUSBAND' },
    { label: 'Grandfather', value: 'GRANDFATHER' },
    { label: 'Uncle', value: 'UNCLE' },
    { label: 'Nephew', value: 'NEPHEW' },
    { label: 'Father In Law', value: 'FATHER_IN_LAW' },
    { label: 'Son In Law', value: 'SON_IN_LAW' },
    { label: 'Brother In Law', value: 'BROTHER_IN_LAW' },
];

export const maleMaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Father', value: 'FATHER' },
    { label: 'Son', value: 'SON' },
    { label: 'Brother', value: 'BROTHER' },
    { label: 'Grandfather', value: 'GRANDFATHER' },
    { label: 'Uncle', value: 'UNCLE' },
    { label: 'Nephew', value: 'NEPHEW' },
    { label: 'Father In Law', value: 'FATHER_IN_LAW' },
    { label: 'Son In Law', value: 'SON_IN_LAW' },
    { label: 'Brother In Law', value: 'BROTHER_IN_LAW' },
];

export const femaleFemaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Mother', value: 'MOTHER' },
    { label: 'Daughter', value: 'DAUGHTER' },
    { label: 'Sister', value: 'SISTER' },
    { label: 'Grandmother', value: 'GRANDMOTHER' },
    { label: 'Aunt', value: 'AUNT' },
    { label: 'Niece', value: 'NIECE' },
    { label: 'Mother In Law', value: 'MOTHER_IN_LAW' },
    { label: 'Daughter In Law', value: 'DAUGHTER_IN_LAW' },
    { label: 'Sister In Law', value: 'SISTER_IN_LAW' },
];

export const relationsMap = {
    MALE: {
        MALE: maleMaleRelations,
        FEMALE: maleFemaleRelations,
    },
    FEMALE: {
        MALE: femaleMaleRelations,
        FEMALE: femaleFemaleRelations,
    },
};

const allRelations = [
    ...maleMaleRelations,
    ...maleFemaleRelations,
    ...femaleMaleRelations,
    ...femaleFemaleRelations,
];

export const getRelations = (g1?: string, g2?: string) => {
    if (!g1 || !g2) return allRelations;
    return relationsMap[g1][g2] ?? [];
};
