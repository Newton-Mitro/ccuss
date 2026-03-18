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
    vouchers?: PettyCashVoucher[];
    replenishments?: PettyCashReplenishment[];
    transactions?: PettyCashTransaction[];
}

export interface ExpenseCategory {
    id: number;
    name: string;
    code: string;
    description?: string;
    created_at: string;
    updated_at: string;

    voucherItems?: PettyCashVoucherItem[];
}

export interface PettyCashVoucher {
    id: number;
    voucher_no: string;
    petty_cash_account_id: number;
    voucher_date: string;
    total_amount: number;
    remarks?: string;
    created_by: number;
    created_at: string;
    updated_at: string;

    account?: PettyCashAccount;
    creator?: User;
    items?: PettyCashVoucherItem[];
    transactions?: PettyCashTransaction[];
}

export interface PettyCashVoucherItem {
    id: number;
    petty_cash_voucher_id: number;
    expense_category_id: number;
    amount: number;
    description?: string;
    receipt_no?: string;
    created_at: string;
    updated_at: string;

    voucher?: PettyCashVoucher;
    expenseCategory?: ExpenseCategory;
}

export interface PettyCashReplenishment {
    id: number;
    replenish_no: string;
    petty_cash_account_id: number;
    source_account: string;
    amount: number;
    replenish_date: string;
    remarks?: string;
    approved_by?: number;
    created_at: string;
    updated_at: string;

    account?: PettyCashAccount;
    approvedBy?: User;
    transactions?: PettyCashTransaction[];
}

export interface PettyCashTransaction {
    id: number;
    petty_cash_account_id: number;
    reference_type:
        | 'PettyCashVoucher'
        | 'PettyCashReplenishment'
        | 'Adjustment';
    reference_id: number;
    debit: number;
    credit: number;
    balance: number;
    transaction_date: string;
    created_at: string;
    updated_at: string;

    account?: PettyCashAccount;
    reference?: PettyCashVoucher | PettyCashReplenishment | null;
}
