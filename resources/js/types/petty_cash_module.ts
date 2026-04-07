import { AuditFields } from './base_types';
import { Branch } from './branch';
import { User } from './user';

export interface PettyCashExpense extends AuditFields {
    id: number;
    name: string;
    code: string;

    branch_id: number;
    custodian_id?: number | null;

    imprest_amount: string; // decimal comes as string from Laravel
    balance: string;

    is_active: boolean;

    // روابط (relations)
    branch?: Branch;

    custodian?: User;

    advance_accounts?: AdvanceExpense[];
}

export interface AdvanceExpense extends AuditFields {
    id: number;
    petty_cash_account_id: number;
    employee_id: number;
    branch_id: number;

    name: string;
    code: string;

    balance: string;
    is_active: boolean;

    // relations
    petty_cash_account?: PettyCashExpense;

    employee?: User;

    branch?: Branch;
}
