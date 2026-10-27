export type Teller = {
    id: number;
    user_id: string;
    code: string;
    name: string;
    maximum_cash: string | number;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    cash_location?: {
        branch_id?: number | string;
    };
};

export type Props = {
    teller?: Teller | null;
    branch_locked?: boolean;
};
