export const maleFemaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Mother', value: 'mother' },
    { label: 'Daughter', value: 'daughter' },
    { label: 'Sister', value: 'sister' },
    { label: 'Wife', value: 'wife' },
    { label: 'Grandmother', value: 'grandmother' },
    { label: 'Aunt', value: 'aunt' },
    { label: 'Niece', value: 'niece' },
    { label: 'Mother In Law', value: 'mother_in_law' },
    { label: 'Daughter In Law', value: 'daughter_in_law' },
    { label: 'Sister In Law', value: 'sister_in_law' },
];

export const femaleMaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Father', value: 'father' },
    { label: 'Son', value: 'son' },
    { label: 'Brother', value: 'brother' },
    { label: 'Husband', value: 'husband' },
    { label: 'Grandfather', value: 'grandfather' },
    { label: 'Uncle', value: 'uncle' },
    { label: 'Nephew', value: 'nephew' },
    { label: 'Father In Law', value: 'father_in_law' },
    { label: 'Son In Law', value: 'son_in_law' },
    { label: 'Brother In Law', value: 'brother_in_law' },
];

export const maleMaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Father', value: 'father' },
    { label: 'Son', value: 'son' },
    { label: 'Brother', value: 'brother' },
    { label: 'Grandfather', value: 'grandfather' },
    { label: 'Uncle', value: 'uncle' },
    { label: 'Nephew', value: 'nephew' },
    { label: 'Father In Law', value: 'father_in_law' },
    { label: 'Son In Law', value: 'son_in_law' },
    { label: 'Brother In Law', value: 'brother_in_law' },
];

export const femaleFemaleRelations = [
    { label: 'None', value: 'none' },
    { label: 'Mother', value: 'mother' },
    { label: 'Daughter', value: 'daughter' },
    { label: 'Sister', value: 'sister' },
    { label: 'Grandmother', value: 'grandmother' },
    { label: 'Aunt', value: 'aunt' },
    { label: 'Niece', value: 'niece' },
    { label: 'Mother In Law', value: 'mother_in_law' },
    { label: 'Daughter In Law', value: 'daughter_in_law' },
    { label: 'Sister In Law', value: 'sister_in_law' },
];

export const relationsMap = {
    male: {
        male: maleMaleRelations,
        female: maleFemaleRelations,
    },
    female: {
        male: femaleMaleRelations,
        female: femaleFemaleRelations,
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
