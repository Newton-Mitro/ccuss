import type { SharedData } from '@/types';

export interface Register {
    route: string;
    title: string;
    singular: string;
    area: string;
    description: string;
    permission: string;
}

export interface RelatedRecord {
    id: number;
    kind: string;
    reference: string;
    title: string;
}

export interface RecordData {
    id: number;
    reference: string;
    title: string;
    category: string | null;
    description: string | null;
    status: string;
    priority: string;
    responsible_person: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    related_record: RelatedRecord | null;
}

export interface ApprovalLog {
    id: number;
    action: string;
    previous_status: string | null;
    new_status: string;
    comment: string | null;
    acted_at: string;
    actor?: { name: string } | null;
}

export interface Props extends SharedData {
    register: Register;
    record: RecordData;
    approvalLogs: ApprovalLog[];
}
