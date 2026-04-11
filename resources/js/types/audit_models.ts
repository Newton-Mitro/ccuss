import { Timestamped } from './base_types';
import { User } from './user';

export type AuditEvent = 'created' | 'updated' | 'deleted';

export interface Audit extends Timestamped {
    id: number;

    // Polymorphic target
    auditable_type: string;
    auditable_id: number;

    // Grouping
    batch_id: string; // UUID

    // Actor & context
    user_id: number | null;
    user?: User | null;

    // Action type
    event: AuditEvent;

    // Change snapshots
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;

    // Request metadata
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
}

export type AuditChange = {
    model: string;
    event: AuditEvent;
    old: Record<string, any> | null;
    new: Record<string, any> | null;
};

export type AuditBatch = {
    batch_id: string;
    event_at: string;
    user?: User;
    changes: AuditChange[];
};
