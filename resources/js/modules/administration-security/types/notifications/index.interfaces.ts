import { SharedData } from '@/types';

export interface NotificationItem {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
        title?: string;
        message?: string;
        url?: string;
        event?: string;
    };
}

export interface Props extends SharedData {
    notifications: {
        data: NotificationItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    unreadCount: number;
}
