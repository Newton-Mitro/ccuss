export interface Ledger {
    id: number;
    code?: string | null;
    name?: string | null;
    type?: string | null;
    account_type?: string | null;
    normal_balance?: string | null;
    account_group_id?: number | string | null;
    parent_id?: number | string | null;
    is_control_account?: boolean | null;
    is_reconcilable?: boolean | null;
    is_system?: boolean | null;
    status?: boolean | null;
}

export interface AccountGroupOption {
    id: number;
    code: string;
    name: string;
}

export interface ParentAccountOption {
    id: number;
    code: string;
    name: string;
}

export interface Props {
    ledger: Ledger;
    parents?: ParentAccountOption[];
    accountGroups?: AccountGroupOption[];
}
