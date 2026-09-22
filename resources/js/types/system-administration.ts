import type { SharedData } from '@/types';
import type { Audit, AuditBatch } from '@/types/audit_models';
import type { ListFilters } from '@/types/base_types';
import type { Branch } from '@/types/branch';
import type { Organization } from '@/types/organization';
import type { PaginatedResponse } from '@/types/paginated_response';
import type { Permission, Role, User } from '@/types/user';

export type AdministrationPagination<T> = PaginatedResponse<T>;

export interface AuditsPageProps extends SharedData {
    audits: AdministrationPagination<Audit>;
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

export interface BranchIndexPageProps extends SharedData {
    branches: AdministrationPagination<Branch>;
    filters: ListFilters;
}

export interface BranchShowPageProps extends SharedData {
    branch: Branch;
}

export interface OrganizationShowPageProps extends Omit<
    SharedData,
    'organization'
> {
    organization: Organization & { branches: Branch[] };
}

export interface RolePermissionPageProps extends SharedData {
    roles: Role[];
    permissions: Permission[];
}

export interface UserFormPageProps extends SharedData {
    user?: User;
    roles: Role[];
    organizations: Organization[];
    permissions?: Permission[];
}

export type BackupType = 'full' | 'database_only' | 'files_only';
export type BackupStatus = 'running' | 'success' | 'failed';

export interface BackupLog {
    id: number;
    file_name: string;
    file_size: number;
    backup_type: BackupType;
    status: BackupStatus;
    started_at: string;
    completed_at?: string;
    duration_seconds?: number;
    message?: string;
    error?: string;
}

export interface BackupHistoryPageProps extends SharedData {
    logs: AdministrationPagination<BackupLog>;
    filters: ListFilters;
}
