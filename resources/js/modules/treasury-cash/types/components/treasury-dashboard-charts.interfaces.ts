export interface TreasuryDashboardChartsProps {
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
