import type {
    Permission,
    Role,
    User,
} from '@/modules/administration-security/types/user';
import type { Branch } from '@/modules/branch-operations/types/branch';
import type { Organization } from '@/modules/organization-settings/types/organization';
import type { SharedData } from '@/types';
import type { ListFilters } from '@/types/base_types';
import type { PaginatedResponse } from '@/types/paginated_response';

export interface BranchIndexPageProps extends SharedData {
    branches: PaginatedResponse<Branch>;
    filters: ListFilters;
}

export interface BranchShowPageProps extends SharedData {
    branch: Branch;
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
    logs: PaginatedResponse<BackupLog>;
    filters: ListFilters;
}
