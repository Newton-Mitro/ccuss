import type { SharedData } from '@/types';

export interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        balance?: string | number;
        available_balance?: string | number;
        status?: string;
        name?: string;
        product?: { name?: string; code?: string } | null;
        holder?: { name?: string } | null;
        loan_account?: {
            loan_no?: string;
            principal_amount?: string | number;
            disbursed_amount?: string | number;
            contractual_rate?: string | number;
            interest_calculation?: string;
            term_value?: number;
            term_unit?: string;
            repayment_frequency?: string;
            interest_frequency?: string;
            grace_days?: number;
            late_payment_fine_rate?: string | number;
            approved_at?: string;
            disbursed_at?: string;
            maturity_date?: string;
            status?: string;
            schedules?: Array<{
                id: number;
                installment_no: number;
                due_date: string;
                total_due?: string | number;
                total_paid?: string | number;
                status: string;
            }>;
        } | null;
    };
}
