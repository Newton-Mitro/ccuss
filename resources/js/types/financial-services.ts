import type { SharedData } from '@/types';
import type { ListFilters } from '@/types/base_types';

export interface FinancialProduct {
    id: number;
    organization_id?: number;
    code: string;
    name: string;
    category:
        | 'SAVINGS'
        | 'SHARE'
        | 'FIXED_DEPOSIT'
        | 'RECURRING_DEPOSIT'
        | 'LOAN'
        | 'OTHER';
    balance_type: 'ASSET' | 'LIABILITY' | 'EQUITY';
    interest_rate: string | number;
    interest_calculation?:
        | 'NONE'
        | 'SIMPLE'
        | 'COMPOUND'
        | 'FLAT'
        | 'REDUCING_BALANCE';
    interest_frequency?:
        | 'NONE'
        | 'DAILY'
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'HALF_YEARLY'
        | 'YEARLY'
        | 'MATURITY';
    settings?: Record<string, unknown> | null;
    is_system?: boolean;
    status: boolean;
    account_mappings?: FinancialProductAccountMapping[];
}

export interface FinancialProductAccountMapping {
    id: number;
    transaction_type: string;
    debit_account_id?: number | null;
    credit_account_id?: number | null;
    status: boolean;
    debit_account?: { code?: string; name?: string } | null;
    credit_account?: { code?: string; name?: string } | null;
}

export interface LedgerAccountOption {
    id: number;
    code: string;
    name: string;
}

export interface FinancialProductsPageProps extends SharedData {
    products: {
        data: FinancialProduct[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: ListFilters;
}

export interface FinancialProductPageProps extends SharedData {
    product: FinancialProduct;
    ledgerAccounts: LedgerAccountOption[];
}

export interface LoanApplication {
    id: number;
    application_no: string;
    requested_amount: string | number;
    approved_amount?: string | number | null;
    requested_term_months?: number | null;
    purpose?: string | null;
    status: string;
    resolution_type?: string | null;
    applied_at?: string | null;
    approved_at?: string | null;
    decision_note?: string | null;
    customer?: { name?: string; customer_no?: string };
    product?: { code?: string; name?: string };
    loan_account?: {
        id: number;
        loan_no: string;
        status: string;
        protection_policy?: LoanProtectionPolicy | null;
        disbursements?: LoanDisbursement[];
        schedules?: LoanSchedule[];
        arrears?: LoanArrear[];
        repayments?: LoanRepayment[];
    } | null;
    collaterals?: LoanCollateral[];
    guarantors?: LoanGuarantor[];
}

export interface LoanCollateral {
    id: number;
    type: string;
    description: string;
    assessed_value?: string | number | null;
    secured_value?: string | number | null;
    status: string;
    notes?: string | null;
}

export interface LoanGuarantor {
    id: number;
    customer_id: number;
    customer?: { name?: string; customer_no?: string };
    status: string;
    notes?: string | null;
}

export interface LoanProtectionPolicy {
    id: number;
    required: boolean;
    coverage_amount?: string | number | null;
    initial_fee?: string | number | null;
    renewal_fee?: string | number | null;
    renewal_frequency: string;
    next_renewal_at?: string | null;
    status: string;
}

export interface LoanDisbursement {
    id: number;
    amount: string | number;
    disbursed_at: string;
    status: string;
    financial_transaction?: {
        id: number;
        transaction_no: string;
        status: string;
        reference?: string | null;
    } | null;
}

export interface LoanSchedule {
    id: number;
    installment_no: number;
    schedule_version?: number;
    due_date: string;
    scheduled_principal: string | number;
    scheduled_interest: string | number;
    scheduled_fee: string | number;
    scheduled_protection_fee: string | number;
    total_due: string | number;
    total_paid: string | number;
    status: string;
    generation_inputs?: Record<string, unknown> | null;
    components?: {
        type: string;
        amount_due: string | number;
        amount_paid: string | number;
        status: string;
    }[];
}

export interface LoanArrear {
    id: number;
    loan_schedule_id: number;
    as_of_date: string;
    days_overdue: number;
    total_overdue: string | number;
    status: string;
    resolution_type?: string | null;
    resolution_note?: string | null;
    resolved_at?: string | null;
}

export interface LoanRepayment {
    id: number;
    amount: string | number;
    repayment_date: string;
    status: string;
    reference?: string | null;
    financial_transaction?: {
        id: number;
        transaction_no: string;
        status: string;
    } | null;
    allocations?: {
        amount: string | number;
        component?: { type: string } | null;
    }[];
}

export interface LoanApplicationIndexPageProps extends SharedData {
    applications: {
        data: LoanApplication[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string; page?: number; per_page?: number };
}

export interface LoanApplicationFormPageProps extends SharedData {
    customers: { id: number; customer_no: string; name: string }[];
    products: { id: number; code: string; name: string }[];
}

export interface LoanApplicationShowPageProps extends SharedData {
    application: LoanApplication;
    guarantorCustomers: { id: number; customer_no: string; name: string }[];
}

export interface FinancialProductFormPageProps extends SharedData {
    product?: FinancialProduct;
}

export interface FinancialAccountOption {
    id: number;
    account_no: string;
    name?: string;
    account_type: string;
    balance?: string | number;
}

export interface FinancialTransactionEntry {
    financial_account?: { account_no?: string } | null;
    direction?: 'DEBIT' | 'CREDIT';
    amount?: string | number;
    balance_after?: string | number | null;
}

export interface FinancialTransaction {
    id: number;
    transaction_no: string;
    transaction_type: string;
    transaction_date: string;
    amount: string | number;
    currency?: string;
    status: 'PENDING' | 'POSTED' | 'REVERSED' | 'CANCELLED';
    description?: string;
    reference?: string;
    entries?: FinancialTransactionEntry[];
    voucher?: {
        id: number;
        voucher_no: string;
        status: string;
        entries?: {
            debit: string | number;
            credit: string | number;
            account?: { code?: string; name?: string } | null;
        }[];
    } | null;
}

export interface FinancialTransactionsPageProps extends SharedData {
    transactions: {
        data: FinancialTransaction[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: ListFilters;
}

export interface FinancialTransactionPageProps extends SharedData {
    transaction: FinancialTransaction;
}

export interface FinancialTransactionFormPageProps extends SharedData {
    accounts: FinancialAccountOption[];
    transactionType?: string;
}

export interface FinancialAccountDetail {
    id: number;
    organization_id?: number;
    branch_id?: number | null;
    financial_product_id?: number | null;
    account_no: string;
    name?: string;
    account_type:
        | 'SAVINGS'
        | 'SHARE'
        | 'FIXED_DEPOSIT'
        | 'RECURRING_DEPOSIT'
        | 'LOAN'
        | 'CASH'
        | 'BANK'
        | 'OTHER';
    status?:
        | 'PENDING'
        | 'ACTIVE'
        | 'DORMANT'
        | 'FROZEN'
        | 'CLOSED'
        | 'WRITTEN_OFF';
    balance?: string | number;
    available_balance?: string | number;
    interest_accrued?: string | number;
    opened_at?: string | null;
    closed_at?: string | null;
    metadata?: Record<string, unknown> | null;
    holder?: { name?: string } | null;
    product?: { name?: string } | null;
    holders?: FinancialAccountHolder[];
    nominees?: DepositNominee[];
    share_account?: ShareAccount | null;
    fixed_deposit?: FixedDeposit | null;
    recurring_deposit?: RecurringDeposit | null;
    loan_account?: LoanAccount | null;
    transactions?: FinancialTransaction[];
}

export interface FinancialAccountHolder {
    id: number;
    name?: string;
    customer_no?: string;
    type?: string;
    pivot?: {
        role?: 'PRIMARY' | 'JOINT';
        ownership_percent?: string | number;
        guardian_customer_id?: number | null;
    };
}

export interface DepositNominee {
    id: number;
    name: string;
    relationship: string;
    phone?: string | null;
    identification_type?: string | null;
    identification_number?: string | null;
    share_percent?: string | number;
    is_primary?: boolean;
}

export interface ShareAccount {
    id: number;
    customer_id: number;
    member_since?: string | null;
    membership_no?: string | null;
    membership_status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export interface FixedDeposit {
    id: number;
    principal_amount?: string | number;
    contractual_rate?: string | number;
    term_months?: number;
    started_at?: string | null;
    maturity_date?: string | null;
    maturity_amount?: string | number | null;
    maturity_instruction?: string;
    status?: string;
}

export interface RecurringDeposit {
    id: number;
    installment_amount?: string | number;
    installment_frequency?: string;
    total_installments?: number;
    paid_installments?: number;
    started_at?: string | null;
    maturity_date?: string | null;
    status?: string;
    installments?: Array<{
        id: number;
        installment_no: number;
        due_date: string;
        status: string;
        amount_due?: string | number;
        amount_paid?: string | number;
        financial_transaction_id?: number | null;
    }>;
}

export interface LoanAccount {
    id: number;
    loan_no?: string;
    principal_amount?: string | number;
    disbursed_amount?: string | number;
    contractual_rate?: string | number;
    term_months?: number;
    maturity_date?: string | null;
    status?: string;
    schedules?: LoanSchedule[];
    arrears?: LoanArrear[];
}

export interface LoanSchedule {
    id: number;
    installment_no: number;
    due_date: string;
    opening_principal?: string | number;
    scheduled_principal?: string | number;
    scheduled_interest?: string | number;
    scheduled_fee?: string | number;
    scheduled_protection_fee?: string | number;
    total_due?: string | number;
    total_paid?: string | number;
    status: string;
    components?: Array<{
        id: number;
        type: string;
        amount_due?: string | number;
        amount_paid?: string | number;
        status: string;
    }>;
}

export interface LoanArrear {
    id: number;
    as_of_date: string;
    days_overdue?: number;
    principal_overdue?: string | number;
    interest_overdue?: string | number;
    fee_overdue?: string | number;
    total_overdue?: string | number;
    status: string;
}

export interface FinancialAccountShowPageProps extends SharedData {
    account: FinancialAccountDetail;
    customers: Array<{
        id: number;
        customer_no: string;
        name: string;
        type: string;
        dob?: string | null;
    }>;
}

export interface AccountStatementMovement {
    id: number;
    transaction_no: string;
    transaction_type: string;
    amount: string | number;
    debit: string | number;
    credit: string | number;
    running_balance: string | number;
    status: string;
    transaction_date: string;
}

export interface SelectedFinancialAccount extends FinancialAccountOption {
    transactions?: AccountStatementMovement[];
    balance?: string | number;
}

export interface AccountStatementPageProps extends SharedData {
    accounts: FinancialAccountOption[];
    account?: SelectedFinancialAccount | null;
    period: string;
    statementDate: string;
    periodStart: string;
    periodEnd: string;
    totals: { debit: number; credit: number; count: number };
    openingBalance: string | number | null;
    closingBalance: string | number | null;
}

export interface ProductPolicy {
    status?: string;
    version?: string | null;
    minimum_opening_amount?: string | number | null;
    minimum_deposit_amount?: string | number | null;
    maximum_deposit_amount?: string | number | null;
    maximum_loan_amount?: string | number | null;
    loan_to_value_percent?: string | number | null;
    interest_rebate_percent?: string | number | null;
    source_url?: string | null;
    source_checked_at?: string | null;
    effective_from?: string | null;
    effective_until?: string | null;
    notes?: string | null;
    deposit_amount_rules?: unknown;
    tenure_rules?: unknown;
    loan_ceiling_rules?: unknown;
    repayment_rules?: unknown;
    eligibility_rules?: unknown;
    security_rules?: unknown;
    documentation_requirements?: unknown;
    maturity_examples?: unknown;
}

export interface FinancialProductPolicyProduct extends Pick<
    FinancialProduct,
    'id' | 'code' | 'name' | 'category'
> {
    policy?: ProductPolicy | null;
}

export interface ProductPolicyFormPageProps extends SharedData {
    product: Pick<FinancialProduct, 'id' | 'code' | 'name' | 'category'>;
    policy?: ProductPolicy | null;
}

export interface ProductPoliciesPageProps extends SharedData {
    products: {
        data: FinancialProductPolicyProduct[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
}

export interface AccountBalancesReportPageProps extends SharedData {
    accounts: {
        data: FinancialAccountDetail[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    products: { id: number; code: string; name: string }[];
    filters: { product_id?: string | number; per_page?: string | number };
}

export interface ProductSummaryItem extends FinancialProduct {
    financial_accounts_count: number;
    financial_accounts_sum_balance: string | number | null;
}

export interface ProductSummaryReportPageProps extends SharedData {
    products: ProductSummaryItem[];
}

export interface TransactionsReportPageProps extends SharedData {
    transactions: {
        data: FinancialTransaction[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
    };
    filters: {
        status?: string;
        page?: number;
        per_page?: number;
    };
}

export interface FinancialWorkflowAccount {
    id: number;
    account_no: string;
    name?: string | null;
    account_type: string;
    balance: string | number;
}

export interface FinancialWorkflowLoanAccount {
    id: number;
    loan_no: string;
    principal_amount: string | number;
    disbursed_amount: string | number;
    customer?: { name?: string } | null;
}

export interface FinancialTransactionWorkflowPageProps extends SharedData {
    workflow: string;
    accounts?: FinancialWorkflowAccount[];
    loan_accounts?: FinancialWorkflowLoanAccount[];
    payout_accounts?: FinancialWorkflowAccount[];
    fines?: FinancialWorkflowFine[];
}

export interface FinancialWorkflowFine {
    id: number;
    assessed_amount: string | number;
    paid_amount: string | number;
    waived_amount: string | number;
    status: string;
    financial_account?: { account_no?: string; name?: string | null } | null;
}
