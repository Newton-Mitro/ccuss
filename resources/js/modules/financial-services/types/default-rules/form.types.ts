import type { SharedData } from '@/types';

export type AccountDefaultRule = {
    id: number;
    financial_product_id: number | null;
    account_type: string;
    name: string;
    grace_days: number;
    fine_calculation: string;
    fine_amount: string | number;
    fine_rate: string | number;
    maximum_fine?: string | number | null;
    extends_maturity: boolean;
    maturity_extension_days: number;
    effective_from: string | null;
    effective_to: string | null;
    is_active: boolean;
};

export type Props = SharedData & {
    rule: AccountDefaultRule | null;
    products: { id: number; code: string; name: string; category: string }[];
};
