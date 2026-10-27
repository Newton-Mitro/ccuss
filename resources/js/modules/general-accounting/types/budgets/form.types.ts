export type Option = { id: number; code?: string; name: string };

export type Entry = {
    account_id: string;
    cost_center_id: string;
    fiscal_period_id: string;
    amount: string;
};

export type Budget = {
    id: number;
    name: string;
    fiscal_year_id: number;
    entries: {
        account_id: number;
        cost_center_id: number | null;
        fiscal_period_id: number | null;
        amount: string | number;
    }[];
};

export type PageProps = {
    budget?: Budget | null;
    fiscalYears: Option[];
    fiscalPeriods: Option[];
    accounts: Option[];
    costCenters: Option[];
};
