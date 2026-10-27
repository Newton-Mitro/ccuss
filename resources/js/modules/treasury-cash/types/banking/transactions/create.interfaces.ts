import { SharedData } from '@/types';

export interface Props extends SharedData {
    bank_accounts: {
        id: number;
        account_name: string;
        account_number: string;
    }[];
    ledger_accounts: {
        id: number;
        code: string;
        name: string;
    }[];
}
