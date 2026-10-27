import { SharedData } from '@/types';

export interface AccountGroup {
    id: number;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    status: boolean;
    parent_id?: number | null;
    level: number;
    children_count: number;
    accounts_count: number;
}

export interface Props extends SharedData {
    accountGroups:
        | {
              data?: AccountGroup[];
          }
        | AccountGroup[];
}
