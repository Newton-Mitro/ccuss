export interface Budget {
    id: number;
    name: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    entries_count: number;
    entries_sum_amount: string;
    fiscal_year: { name: string };
}
