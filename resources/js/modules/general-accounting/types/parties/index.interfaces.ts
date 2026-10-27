import { type Party } from '@/modules/general-accounting/parties/party-dialog';
import { SharedData } from '@/types';

export interface Props extends SharedData {
    parties: {
        data: Party[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string; per_page?: string; page?: string };
}
