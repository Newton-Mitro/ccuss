import type { SharedData } from '@/types';

export interface Installment {
    id: number;
    installment_no: number;
    due_date: string;
    status: string;
    amount_due?: string | number;
    amount_paid?: string | number;
    financial_transaction_id?: number | null;
    financial_transaction?: TransactionReference | null;
    transaction_entries?: Array<{
        transaction?: TransactionReference | null;
    }>;
}

export interface TransactionReference {
    id: number;
    transaction_no: string;
    reference?: string | null;
    status: string;
}

export interface Props extends SharedData {
    can_manage_recurring_deposits: boolean;
    account: {
        id: number;
        account_no: string;
        status: string;
        account_type?: string;
        balance?: string | number;
        holder?: { name?: string } | null;
        product?: { name?: string } | null;
        recurring_deposit?: {
            id: number;
            installment_amount?: string | number;
            installment_frequency?: string;
            total_installments?: number;
            paid_installments?: number;
            started_at?: string;
            maturity_date?: string;
            closed_at?: string | null;
            installments?: Installment[];
        } | null;
    };
}
