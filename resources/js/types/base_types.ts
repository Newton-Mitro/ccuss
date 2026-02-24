/* ===========================
 * Shared / Base Types
 * =========================== */

import { User } from './user';

export type ID = number;
export type Timestamp = string; // ISO 8601

export interface AuditFields {
    created_by?: ID | null;
    created_by_user?: Pick<User, 'id' | 'name'> | null;
    updated_by?: ID | null;
    updated_by_user?: Pick<User, 'id' | 'name'> | null;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export type ModalMode = 'create' | 'edit' | 'view';
