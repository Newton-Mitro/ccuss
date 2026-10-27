export type ProductTermData = {
    id?: number;
    code: string;
    name: string;
    tenure_value: string;
    tenure_unit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    interest_rate: string;
    interest_calculation: string;
    interest_frequency: string;
    minimum_amount: string;
    maximum_amount: string;
    status: boolean;
    effective_from: string;
    effective_until: string;
};
