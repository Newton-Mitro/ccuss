import type { SharedData } from '@/types';

export interface DashboardProps extends SharedData {
    stats: {
        branches: number;
        members: number;
        activeAccounts: number;
        loanPortfolio: number;
        pendingApplications: number;
        pendingTransactions: number;
        monthTransactionVolume: number;
        openBranchDays: number;
        openTellerSessions: number;
        openVaultSessions: number;
    };
    dailyVolume: { date: string; label: string; amount: number }[];
    accountMix: { type: string; count: number; balance: number }[];
    recentTransactions: {
        id: number;
        number: string;
        type: string;
        date: string | null;
        amount: number;
        status: string;
        branch: string | null;
        accounts: string[];
    }[];
    pendingApplicationsList: {
        id: number;
        number: string;
        applicant: string;
        amount: number;
        status: string;
        created_at: string | null;
    }[];
    quickLinks: { label: string; href: string }[];
    today: string;
}
