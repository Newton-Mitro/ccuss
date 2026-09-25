import type { SharedData } from '@/types';

export interface BankAccountCreatePageProps extends SharedData {
    banks: { id: number; code: string; name: string }[];
    financial_accounts: { id: number; account_no: string; name: string }[];
    branches: { id: number; code: string; name: string }[];
}

export interface BankCreatePageProps extends Omit<SharedData, 'organization'> {
    organization?: { id: number; name: string };
}

export interface BankTransactionListItem {
    id: number;
    transaction_no: string;
    type:
        | 'DEPOSIT'
        | 'WITHDRAWAL'
        | 'TRANSFER_IN'
        | 'TRANSFER_OUT'
        | 'CHARGE'
        | 'INTEREST'
        | 'ADJUSTMENT';
    amount: string | number;
    transaction_date: string;
    reference?: string | null;
    description?: string | null;
    balance_after?: string | number | null;
    status: 'PENDING' | 'POSTED' | 'RECONCILED' | 'CANCELLED';
    bank_account?: {
        account_name: string;
        account_number: string;
        bank?: { name: string; code: string } | null;
    } | null;
}

export interface BankTransactionIndexPageProps extends SharedData {
    transactions: {
        data: BankTransactionListItem[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
}

export interface TellerSessionOption {
    id: number;
    opening_cash?: string | number;
    expected_cash?: string | number | null;
    teller?: { name: string; code: string } | null;
    branch_day?: { business_date: string } | null;
}

export interface CashAdjustmentFormPageProps extends SharedData {
    teller_sessions: TellerSessionOption[];
}

export interface CashLocationOption {
    id: number;
    code: string;
    name: string;
    type?: string;
}

export interface TellerTransferPageProps extends SharedData {
    branch_day: { id: number; business_date: string; status: string } | null;
    cash_locations: CashLocationOption[];
}

export interface ChequeBookCreatePageProps extends SharedData {
    financial_accounts: {
        id: number;
        account_no: string;
        name?: string | null;
        holder_type?: string | null;
        holder_id?: number | null;
    }[];
}

export interface PettyCashAccountCreatePageProps extends SharedData {
    cash_locations: CashLocationOption[];
}

export interface PettyCashFundOption {
    id: number;
    code: string;
    name: string;
    current_balance: string | number;
    fund_limit: string | number;
}

export interface PettyCashTransactionFormPageProps extends SharedData {
    transaction_type: 'FUNDING' | 'EXPENSE';
    branch_day: { business_date: string; status: string } | null;
    funds: PettyCashFundOption[];
}

export interface TellerCashTransactionFormPageProps extends SharedData {
    transaction_type: 'DEPOSIT' | 'WITHDRAWAL';
    teller_sessions: TellerSessionOption[];
    financial_accounts: {
        id: number;
        account_no: string;
        name?: string | null;
        account_type: string;
        balance: string | number;
    }[];
}

export interface TellerCreatePageProps extends SharedData {
    users: { id: number; name: string; email: string }[];
}
