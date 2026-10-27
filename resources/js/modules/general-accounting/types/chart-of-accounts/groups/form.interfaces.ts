export interface AccountGroup {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    parent_id?: number | null;
    status: boolean;
}

export interface AccountGroupParent {
    id: number;
    code: string;
    name: string;
}

export interface Props {
    accountGroup?: AccountGroup;
    parents?: AccountGroupParent[];
}
