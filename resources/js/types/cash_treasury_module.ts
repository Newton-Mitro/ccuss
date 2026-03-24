import { Branch } from './branch';
import { User } from './user';

export interface BranchDay {
    id: number;
    branch_id: number;
    business_date: string; // ISO date
    opened_at?: string; // ISO datetime
    closed_at?: string; // ISO datetime
    opened_by?: number;
    closed_by?: number;
    status: 'open' | 'closed';
    created_at: string;
    updated_at: string;

    // Optional relations
    branch?: Branch;
    openedBy?: User;
    closedBy?: User;
    tellerSessions?: TellerSession[];
}

export interface Denomination {
    id: number;
    value: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    vaultDenominations?: VaultDenomination[];
}

export interface Vault {
    id: number;
    branch_id: number;
    name: string;
    total_balance: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    branch?: Branch;
    vaultDenominations?: VaultDenomination[];
    transactions?: VaultTransaction[];
}

export interface Teller {
    id: number;
    user_id: number;
    branch_id: number;
    code: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    user?: User;
    branch?: Branch;
    sessions?: TellerSession[];
    limits?: TellerLimit[];
}

export interface VaultDenomination {
    id: number;
    vault_id: number;
    denomination_id: number;
    count: number;
    created_at: string;
    updated_at: string;

    vault?: Vault;
    denomination?: Denomination;
}

export interface VaultTransaction {
    id: number;
    vault_id: number;
    teller_id?: number;
    amount: number;
    type: 'IN' | 'OUT';
    reference?: string;
    transaction_date: string;
    remarks?: string;
    created_at: string;
    updated_at: string;

    vault?: Vault;
    teller?: Teller;
}

export interface TellerSession {
    id: number;
    teller_id: number;
    branch_day_id: number;
    opening_cash: number;
    closing_cash?: number;
    opened_at: string;
    closed_at?: string;
    status: 'open' | 'closed';
    created_at: string;
    updated_at: string;

    teller?: Teller;
    branchDay?: BranchDay;
    cashDrawers?: CashDrawer[];
    vaultTransfers?: TellerVaultTransfer[];
}

export interface CashDrawer {
    id: number;
    teller_session_id: number;
    vault_id: number;
    opening_balance: number;
    closing_balance?: number;
    created_at: string;
    updated_at: string;

    session?: TellerSession;
    vault?: Vault;
    transactions?: CashTransaction[];
    balancings?: CashBalancing[];
    adjustments?: CashAdjustment[];
    auditLogs?: CashAuditLog[];
}

export interface CashTransaction {
    id: number;
    cash_drawer_id: number;
    amount: number;
    type: 'CASH_IN' | 'CASH_OUT';
    source_type: string;
    source_id: number;
    reference?: string;
    transaction_date: string;
    remarks?: string;
    created_at: string;
    updated_at: string;

    cashDrawer?: CashDrawer;
}

export interface CashBalancing {
    id: number;
    cash_drawer_id: number;
    expected_balance: number;
    actual_balance: number;
    difference: number;
    verified_by?: number;
    balanced_at: string;
    remarks?: string;
    created_at: string;
    updated_at: string;

    cashDrawer?: CashDrawer;
    verifiedBy?: User;
}

export interface TellerLimit {
    id: number;
    teller_id: number;
    max_cash_limit: number;
    max_transaction_limit: number;
    created_at: string;
    updated_at: string;

    teller?: Teller;
}

export interface CashAdjustment {
    id: number;
    cash_drawer_id: number;
    amount: number;
    type: 'shortage' | 'excess';
    reason?: string;
    approved_by?: number;
    created_at: string;
    updated_at: string;

    cashDrawer?: CashDrawer;
    approvedBy?: User;
}

export interface TellerVaultTransfer {
    id: number;
    vault_id: number;
    teller_session_id: number;
    amount: number;
    type: 'CASH_TO_TELLER' | 'CASH_TO_VAULT';
    transfer_date: string;
    created_at: string;
    updated_at: string;

    vault?: Vault;
    tellerSession?: TellerSession;
}

export interface VaultTransfer {
    id: number;
    from_vault_id: number;
    to_vault_id: number;
    amount: number;
    transfer_date: string;
    approved_by?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;

    fromVault?: Vault;
    toVault?: Vault;
    approvedBy?: User;
}

export interface CashAuditLog {
    id: number;
    cash_drawer_id?: number;
    user_id: number;
    action: string;
    details?: string;
    action_time: string;
    created_at: string;
    updated_at: string;

    cashDrawer?: CashDrawer;
    user?: User;
}
