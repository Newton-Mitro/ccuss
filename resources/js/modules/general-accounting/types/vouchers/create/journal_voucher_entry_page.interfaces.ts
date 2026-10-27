export interface Account {
    id: number;
    code: string;
    name: string;
    type?: string;
    is_control_account?: boolean;
}

export interface CostCenter {
    id: number;
    code: string;
    name: string;
}

export interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
}

export interface FiscalPeriod {
    id: number;
    name: string;
    fiscal_year?: {
        name: string;
    };
}

export interface Entry {
    account_id: string;
    party_id: string;
    debit: string;
    credit: string;
    description: string;
    cost_center_id: string;
}
