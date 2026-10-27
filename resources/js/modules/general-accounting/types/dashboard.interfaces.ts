import type { SharedData } from '@/types';

export interface GeneralAccountingDashboardProps extends SharedData {
    stats: {
        accountGroups: number;
        ledgerAccounts: number;
        openFiscalYears: number;
        openFiscalPeriods: number;
        draftVouchers: number;
        postedVouchers: number;
        activeBudgets: number;
    };
    dailyVoucherActivity: {
        date: string;
        label: string;
        posted: number;
    }[];
    voucherStatusBreakdown: {
        status: string;
        count: number;
    }[];
}
