export type GlAccountType =
    | 'ASSET'
    | 'LIABILITY'
    | 'EQUITY'
    | 'INCOME'
    | 'EXPENSE';
export type GlAccountCategory = 'GROUP' | 'GL';

export interface GlAccount {
    id: number;
    code: string; // Unique GL code
    name: string; // Account name
    type: GlAccountType; // GL account category
    category: GlAccountCategory; // GROUP or GL
    parent_id?: number | null; // Optional parent account reference
    created_at: string;
    updated_at: string;
    children?: GlAccount[]; // Optional for nested/grouped accounts
}

export type SubledgerType =
    | 'DEPOSIT'
    | 'LOAN'
    | 'SHARE'
    | 'INSURANCE'
    | 'CASH'
    | 'FIXED_ASSET'
    | 'PAYROLL'
    | 'VENDOR'
    | 'FEE'
    | 'INTEREST'
    | 'PROTECTION_PREMIUM'
    | 'PROTECTION_RENEWAL'
    | 'ADVANCE_DEPOSIT';

export type AssociateLedgerType =
    | 'FEE'
    | 'FINE'
    | 'PROVISION'
    | 'INTEREST'
    | 'DIVIDEND'
    | 'REBATE'
    | 'PROTECTION_PREMIUM'
    | 'PROTECTION_RENEWAL';

export interface JournalEntry {
    id: number;
    tx_code?: string; // Transaction code (e.g., PAY_VOUCHER)
    tx_ref?: string; // Transaction reference (e.g., cheque_no)
    posted_at: string; // Timestamp
    branch_id?: number; // Nullable branch reference
    user_id?: number; // Nullable user reference
    memo?: string; // Remarks or description
    created_at: string;
    updated_at: string;
    lines?: JournalLine[]; // Optional relation
}

export interface JournalLine {
    id: number;
    journal_entry_id: number;
    gl_account_id: number;
    subledger_type?: SubledgerType | null;
    subledger_id?: number | null;
    associate_ledger_type?: AssociateLedgerType | null;
    associate_ledger_id?: number | null;
    debit: number;
    credit: number;
    created_at: string;
    updated_at: string;
}
