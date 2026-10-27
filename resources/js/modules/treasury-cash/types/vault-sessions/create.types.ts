export type BranchDay = {
    id: number;
    business_date: string;
    branch_name?: string;
};

export type VaultOption = {
    id: number;
    code: string;
    name: string;
    current_balance?: string | number | null;
};

export type PageProps = {
    branch_day?: BranchDay;
    branch_days?: BranchDay[];
    vaults?: VaultOption[];
    user_branch_id?: number | null;
};
