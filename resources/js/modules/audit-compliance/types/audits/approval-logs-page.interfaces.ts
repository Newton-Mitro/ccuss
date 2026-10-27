import type { SharedData } from '@/types';

export interface ApprovalLog {
    id: number;
    record_id: number | null;
    record_kind: string;
    record_reference: string;
    record_title: string;
    action: string;
    previous_status: string | null;
    new_status: string;
    comment: string | null;
    acted_at: string;
    actor?: { name: string } | null;
    record?: { id: number } | null;
}

export interface Props extends SharedData {
    logs: {
        data: ApprovalLog[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        total: number;
    };
    filters: {
        action?: string;
        search?: string;
        per_page?: number;
    };
    actions: string[];
}
