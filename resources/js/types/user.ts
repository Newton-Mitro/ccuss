import { Branch } from './branch';
import { Organization } from './organization';

// types/role.ts
export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
    permissions?: Permission[];
}

// types/permission.ts
export interface Permission {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    organization_id: number;
    branch_id: number;
    organization?: Organization;
    branch?: Branch;
    roles: Role[];
    permissions: Permission[];
    permissions?: Permission[];
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
}
