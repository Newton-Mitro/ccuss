export type AuditChange = {
    model: string;
    event: 'CREATED' | 'UPDATED' | 'DELETED';
    old: Record<string, any> | null;
    new: Record<string, any> | null;
};

export type AuditBatch = {
    batch_id: string;
    event_at: string;
    user: { id: number; name: string };
    changes: AuditChange[];
};
