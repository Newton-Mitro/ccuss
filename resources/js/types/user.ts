import { Branch } from './branch';

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
    module: string;
    name: string;
    slug: string;
    action?: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    branch_id?: number | null;
    branch?: Branch;
    roles: Role[];
    permissions?: Permission[];
    email_verified_at?: string | null;
    avatar?: string | null;
    status?: string | null;
    created_at?: string;
    updated_at?: string;
}
