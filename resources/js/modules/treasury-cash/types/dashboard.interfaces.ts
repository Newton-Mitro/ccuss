import type { SharedData } from '@/types';

export interface TreasuryCashDashboardProps extends SharedData {
    stats: {
        vaults: number;
        tellers: number;
        openBranchDays: number;
        openTellerSessions: number;
    };
    cashAccounts: {
        id: number;
        type: string;
        code: string;
        name: string;
        account_no: string | null;
    }[];
    dailyActivity: {
        date: string;
        label: string;
        teller_cash: number;
        bank: number;
    }[];
    cashLocationBalances: {
        type: string;
        locations: number;
        balance: number;
    }[];
}
