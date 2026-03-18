import { AuditFields } from './base_types';

export type AuditEvent = 'CREATED' | 'UPDATED' | 'DELETED';

export interface Audit extends AuditFields {
    id: number;

    // Polymorphic target
    auditable_type: string;
    auditable_id: number;

    // Grouping
    batch_id: string; // UUID

    // Actor & context
    user_id: number | null;

    // Action type
    event: AuditEvent;

    // Change snapshots
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;

    // Request metadata
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;

    // Timestamps
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
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
    creator: { id: number; name: string };
    changes: AuditChange[];
};
