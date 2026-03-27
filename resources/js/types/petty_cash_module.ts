import { Branch } from './branch';
import { User } from './user';

export interface PettyCashAccount {
    id: number;
    name: string;
    code: string;
    branch_id: number;
    custodian_id?: number;
    imprest_amount: number;
    current_balance: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    branch?: Branch;
    custodian?: User;
}
