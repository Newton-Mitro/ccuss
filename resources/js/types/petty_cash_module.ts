import { AuditFields } from './base_types';
import { Branch } from './branch';
import { User } from './user';

export interface PettyCashAccount extends AuditFields {
    id: number;
    name: string;

    branch_id: number;
    created_by?: number | null;
    approved_by?: number | null;

    status: 'active' | 'inactive';

    // relations
    branch?: Branch;
    creator?: User;
    approver?: User;
    advances?: PettyCashAdvance[];
}

export interface PettyCashAdvance extends AuditFields {
    id: number;
    petty_cash_account_id: number;
    employee_id: number;

    amount: string; // decimal as string from Laravel
    advance_date: string; // ISO date string
    purpose?: string | null;
    status: 'pending' | 'approved' | 'settled' | 'rejected';
    approved_by?: number | null;
    settled_at?: string | null; // ISO datetime string
    remarks?: string | null;

    // relations
    petty_cash_account?: PettyCashAccount;
    employee?: User;
    approver?: User;
}
