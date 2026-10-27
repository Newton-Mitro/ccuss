import { KycDocument } from '@/modules/customers-kyc/types/customer_kyc_module';
import { SharedData } from '@/types';
import { PaginatedResponse } from '@/types/paginated_response';

export interface Props extends SharedData {
    paginated_data: PaginatedResponse<KycDocument>;
    filters: Record<string, string>;
}
