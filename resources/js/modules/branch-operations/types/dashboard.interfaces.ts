import type { SharedData } from '@/types';

export interface BranchOperationsDashboardProps extends SharedData {
    branch: { id: number; code: string; name: string } | null;
    branch_day: {
        id: number;
        business_date: string;
        status: string;
        opened_at: string | null;
    } | null;
    metrics: {
        assigned_tellers: number;
        open_sessions: number;
        pending_transactions: number;
        posted_today_amount: number;
    };
    open_sessions: {
        id: number;
        teller_name: string;
        teller_code: string | null;
        teller_account_no: string | null;
        business_date: string | null;
        opened_at: string | null;
        expected_cash: number;
    }[];
    recent_activity: {
        id: number;
        transaction_no: string;
        type: string;
        amount: number;
        status: string;
        requested_at: string | null;
        cash_location: string | null;
        teller: string | null;
    }[];
    daily_posted_amounts: { date: string; label: string; amount: number }[];
    transaction_types: { type: string; count: number }[];
}
