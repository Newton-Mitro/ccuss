import type { SharedData } from '@/types';

export interface FinancialServicesDashboardProps extends SharedData {
    monthlyTransactions: {
        label: string;
        count: number;
    }[];
    metrics: {
        depositProducts: number;
        loanProducts: number;
        accounts: number;
        activeAccounts: number;
        postedTransactions: number;
    };

    recentTransactions: {
        id: number;
        transaction_no: string;
        transaction_type: string;
        amount: string | number;
        status: string;
        entries?: {
            financial_account?: {
                account_no?: string;
            } | null;
        }[];
    }[];
}
