import type { SharedData } from '@/types';

export type Rule = {
    id: number;
    name: string;
    account_type: string;
    fine_calculation: string;
    fine_amount: string | number;
    fine_rate: string | number;
    maximum_fine?: string | number | null;
    grace_days: number;
    financial_product_id: number | null;
    extends_maturity: boolean;
    maturity_extension_days: number;
    effective_from: string | null;
    effective_to: string | null;
    is_active: boolean;
    product?: { code: string; name: string } | null;
};

export type Props = SharedData & {
    rules: Rule[];
};
