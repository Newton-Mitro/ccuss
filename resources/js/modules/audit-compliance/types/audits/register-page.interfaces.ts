import type { SharedData } from '@/types';

export interface Register {
    route: string;
    title: string;
    singular: string;
    area: string;
    description: string;
    permission: string;
}

export interface RegisterRecord {
    id: number;
    reference: string;
    title: string;
    category: string | null;
    status: string;
    priority: string;
    responsible_person: string | null;
    due_date: string | null;
    updated_at: string;
}

export interface Props extends SharedData {
    register: Register;
    records: {
        data: RegisterRecord[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        page?: number;
        per_page?: number;
    };
    statuses: string[];
    priorities: string[];
}
