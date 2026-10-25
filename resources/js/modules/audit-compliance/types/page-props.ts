import type {
    Audit,
    AuditBatch,
} from '@/modules/audit-compliance/types/audit_models';
import type { SharedData } from '@/types';
import type { ListFilters } from '@/types/base_types';
import type { PaginatedResponse } from '@/types/paginated_response';

export interface AuditsPageProps extends SharedData {
    audits: PaginatedResponse<Audit>;
    filters: ListFilters & {
        event?: string;
        user_id?: number;
    };
}

export interface AuditBatchPageProps {
    batch: AuditBatch;
}

export interface ModelHistoryPageProps extends SharedData {
    auditableType: string;
    auditableId: number;
    batches: AuditBatch[];
}
