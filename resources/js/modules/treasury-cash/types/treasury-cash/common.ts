import type { ListFilters } from '@/types/base_types';
import type { PaginatedResponse } from '@/types/paginated_response';

export type TreasuryListResponse<T> = PaginatedResponse<T>;
export type TreasuryListFilters = ListFilters;
