export type BranchDay = {
    id: number;
    business_date: string;
    branch_name?: string;
};

export type Teller = {
    id: number;
    name: string;
    code: string;
    current_balance?: string | number | null;
};
