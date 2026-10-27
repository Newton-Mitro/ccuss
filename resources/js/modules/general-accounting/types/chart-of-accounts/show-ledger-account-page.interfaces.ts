export interface RelatedLedger {
    id: number;
    code?: string | null;
    name?: string | null;
}

export interface RelatedGroup {
    id: number;
    code?: string | null;
    name?: string | null;
}

export interface Ledger {
    id: number;
    code?: string | null;
    name?: string | null;
    type?: string | null;
    account_type?: string | null;
    normal_balance?: string | null;
    account_group_id?: number | null;
    parent_id?: number | null;
    status?: boolean | null;
    is_active?: boolean | null;
    is_group?: boolean | null;
    is_control_account?: boolean | null;
    is_reconcilable?: boolean | null;
    is_cash_account?: boolean | null;
    is_system?: boolean | null;
    subledger_type?: string | null;
    subledger_sub_type?: string | null;
    description?: string | null;
    group?: RelatedGroup | null;
    parent?: RelatedLedger | null;
    children?: RelatedLedger[];
}

export interface Props {
    ledger: Ledger;
}
