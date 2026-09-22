import type { SharedData } from '@/types';
import type { ListFilters } from '@/types/base_types';
import type {
    FiscalPeriod,
    FiscalYear,
    LedgerAccount,
} from '@/types/finance_and_accounting';
import type { PaginatedResponse } from '@/types/paginated_response';

export type AccountingPagination<T> = PaginatedResponse<T>;
export type AccountingFilters = ListFilters & { status?: string };

export interface GeneralLedgerAccount extends LedgerAccount {
    children_recursive?: GeneralLedgerAccount[];
}

export interface GeneralLedgerAccountsPageProps extends SharedData {
    glAccounts: AccountingPagination<GeneralLedgerAccount>;
    fiscalYears: FiscalYear[];
    fiscalPeriods: FiscalPeriod[];
    fiscal_year_id: number | null;
    fiscal_period_id: number | null;
}

export interface FiscalPeriodRow extends FiscalPeriod {
    fiscal_year?: { name: string };
}

export interface FiscalPeriodsPageProps extends SharedData {
    fiscalPeriods: AccountingPagination<FiscalPeriodRow>;
    filters: AccountingFilters;
}

export interface FiscalPeriodFormPageProps extends SharedData {
    fiscalPeriod?: {
        id: number;
        name: string;
        fiscal_year_id: number;
        start_date: string;
        end_date: string;
        status: 'OPEN' | 'CLOSED';
    };
    fiscalYears: { id: number; code: string }[];
}

export interface FiscalYearFormPageProps extends SharedData {
    fiscalYear?: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        status: 'OPEN' | 'CLOSED';
        is_current: boolean;
    };
}

export interface RetainedEarningsAccount {
    id: number;
    code: string;
    name: string;
}

export interface FiscalYearsPageProps extends SharedData {
    fiscalYears: AccountingPagination<FiscalYear>;
    retainedEarningsAccounts: RetainedEarningsAccount[];
    filters: AccountingFilters;
}

export interface VoucherListItem {
    id: number;
    voucher_no: string;
    voucher_type: string;
    voucher_date: string;
    status: string;
    fiscal_year?: { code?: string };
    fiscal_period?: { name?: string; period_name?: string };
    branch?: { name: string };
    entries?: { debit: number; credit: number }[];
}

export interface VoucherIndexPageProps extends SharedData {
    vouchers: AccountingPagination<VoucherListItem>;
    filters: AccountingFilters;
}

export interface VoucherViewPageProps extends SharedData {
    voucher: any;
    flash: { success?: string; error?: string };
    backUrl: string;
}
