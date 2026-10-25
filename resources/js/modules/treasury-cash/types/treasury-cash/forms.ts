import type { Customer } from '@/modules/customers-kyc/types/customer_kyc_module';
import type { SharedData } from '@/types';

export interface BankAccountCreatePageProps extends SharedData {
    branches: { id: number; code: string; name: string }[];
    ledger_accounts: { id: number; code: string; name: string }[];
    account?: {
        id: number;
        branch_id: number | null;
        account_name: string;
        account_number: string;
        routing_number: string | null;
        account_type: string;
        opening_balance: string | number;
        is_reconcilable: boolean;
        status: string;
    };
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
    counterpart_account?: {
        id: number;
        code: string;
        name: string;
    } | null;
    status: 'PENDING' | 'POSTED' | 'RECONCILED' | 'CANCELLED';
    bank_account?: {
        account_name: string;
        account_number: string;
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
    ledger_accounts: { id: number; code: string; name: string }[];
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

export interface CashBranchOption {
    id: number;
    code: string;
    name: string;
}

export interface TellerTransferPageProps extends SharedData {
    branch_day: { id: number; business_date: string; status: string } | null;
    transfer_type:
        | 'TELLER_TO_TELLER'
        | 'VAULT_TO_TELLER'
        | 'TELLER_TO_VAULT'
        | 'VAULT_TO_VAULT'
        | 'BANK_TO_VAULT'
        | 'VAULT_TO_BANK';
    from_cash_locations: CashLocationOption[];
    to_cash_locations: CashLocationOption[];
    bank_accounts?: {
        id: number;
        account_name: string;
        account_number: string;
    }[];
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
    branches?: CashBranchOption[];
    default_branch_id?: number | null;
    default_custodian_id?: number | null;
    branch_locked?: boolean;
    users?: {
        id: number;
        branch_id: number | null;
        name: string;
        email: string;
    }[];
    fund?: {
        id: number;
        code: string;
        name: string;
        custodian_id: number | null;
        fund_limit: string | number;
        current_balance: string | number;
        method: 'IMPREST' | 'VARIABLE';
        status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
        cash_location?: { branch_id: number };
    };
}

export interface VaultCreatePageProps extends SharedData {
    branches?: CashBranchOption[];
    default_branch_id?: number | null;
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

export interface SavingsChequeWithdrawalPageProps extends SharedData {
    customer: Customer | null;
    signature_verified: boolean;
    savings_accounts: {
        id: number;
        account_no: string;
        name?: string | null;
        account_type: string;
        balance: string | number;
        available_balance: string | number;
        account_holder: {
            id: number;
            name: string;
            customer_no: string;
            primary_phone: string | null;
            signature: {
                url: string;
                verification_status: string;
            } | null;
        } | null;
        account_holders: {
            id: number;
            name: string;
            customer_no: string;
            primary_phone: string | null;
            role: string;
            ownership_percent: string | number;
            signature: {
                url: string;
                verification_status: string;
            } | null;
        }[];
        authorized_persons: {
            id: number;
            customer_id: number;
            customer_name: string | null;
            customer_no: string | null;
            primary_phone: string | null;
            authorization_type: string;
            designation: string | null;
            transaction_limit: string | number | null;
            is_active: boolean;
            effective_from: string | null;
            effective_to: string | null;
            signature: {
                url: string;
                verification_status: string;
            } | null;
        }[];
    }[];
    available_cheques: {
        id: number;
        financial_account_id: number;
        cheque_book_id: number;
        cheque_no: string;
        status: string;
        amount: string | number;
        payee?: string | null;
        issue_date?: string | null;
    }[];
    teller_sessions: TellerSessionOption[];
}

export interface TellerCreatePageProps extends SharedData {
    branches?: CashBranchOption[];
    default_branch_id?: number | null;
    users: { id: number; branch_id?: number; name: string; email: string }[];
}
