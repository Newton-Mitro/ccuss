import type { SharedData } from '@/types';

export interface Dashboard {
    route: string;
    title: string;
    description: string;
    area: string;
}

export interface Register {
    route: string;
    title: string;
    singular: string;
    description: string;
    count: number;
    open_count: number;
}

export interface RecentRecord {
    id: number;
    reference: string;
    title: string;
    kind: string;
    status: string;
    priority: string;
    due_date: string | null;
    register_route: string;
}

export interface Props extends SharedData {
    dashboard: Dashboard;
    summary: {
        total: number;
        open: number;
        overdue: number;
        approved: number;
        rejected: number;
    };
    registers: Register[];
    statusCounts: Record<string, number>;
    recentRecords: RecentRecord[];
}
