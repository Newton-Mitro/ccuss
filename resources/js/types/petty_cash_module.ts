import { Timestamped } from './base_types';
import { Branch } from './branch';
import { User } from './user';

export interface PettyCashAccount extends Timestamped {
    id: number;
    name: string;

    branch_id: number | null;
    subledger_account_id: number;

    upper_limit: string; // decimal from Laravel
    balance?: string; // future-ready field for current balance, decimal from Laravel
    status: 'active' | 'inactive';

    // relations
    branch?: Branch;
    subledger_account?: any; // replace with LedgerAccount type if available
    employees?: PettyCashAdvanceAccount[];
}

export interface PettyCashAdvanceAccount extends Timestamped {
    id: number;

    petty_cash_account_id: number;
    employee_id: number;
    subledger_account_id: number;
    balance?: string; // future-ready field for current balance, decimal from Laravel

    status: 'active' | 'inactive';

    // relations
    petty_cash_account?: PettyCashAccount;
    employee?: User;
    subledger_account?: any;
}
