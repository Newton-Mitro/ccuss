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

export type BackupType = 'FULL' | 'DATABASE_ONLY' | 'FILES_ONLY';
export type BackupStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface BackupLog {
    id: number;
    file_name?: string | null;
    file_path?: string | null;
    file_size?: number | null;
    storage_disk?: string;
    backup_type: BackupType;
    status: BackupStatus;
    checksum?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    duration_seconds?: number | null;
    message?: string;
    error?: string;
    created_by?: number | null;
}

export interface BackupHistoryPageProps extends SharedData {
    logs: AdministrationPagination<BackupLog>;
    filters: ListFilters;
}
