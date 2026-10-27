export interface AccountGroupTreeItem {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    status: boolean;
    parent_id?: number | null;
    level: number;
    children_count: number;
    accounts_count: number;
}
