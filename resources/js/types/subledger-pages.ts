import type { SharedData } from '@/types';
import type { ListFilters } from '@/types/base_types';
import type { PaginatedResponse } from '@/types/paginated_response';
import type { Subledger } from '@/types/subledger_module';

export type SubledgerPagination<T> = PaginatedResponse<T>;

export interface SubledgerAccount {
    id: number;
    account_number: string;
    name: string | null;
    type: string;
    status: string;
    branch?: { name: string };
    subledger?: { name: string };
    accountable_type: string;
}

export interface SubledgerAccountsPageProps extends SharedData {
    accounts: SubledgerPagination<SubledgerAccount>;
    filters: ListFilters & { type?: string; status?: string };
}

export interface SubledgersPageProps extends SharedData {
    subledgers: SubledgerPagination<Subledger>;
    filters: ListFilters;
}
