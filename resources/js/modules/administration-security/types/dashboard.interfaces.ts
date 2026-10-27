import type { SharedData } from '@/types';

export interface AdministrativeTasksDashboardProps extends SharedData {
    stats: {
        users: number;
        roles: number;
        auditLogs: number;
        successfulBackups: number;
    };
}
