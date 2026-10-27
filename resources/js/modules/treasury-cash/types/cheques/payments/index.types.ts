import type { SharedData } from '@/types';

export type PaymentRow = {
    id: number;
    status: string;
    amount: string | number;
    created_at: string;
    cheque: { cheque_no: string };
    financial_account: { account_no: string };
    received_by?: { name: string } | null;
};

export type Props = SharedData & {
    payments: {
        data: PaymentRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    available_cheques: {
        id: number;
        cheque_no: string;
        amount: number;
        account_no: string | null;
    }[];
    teller_sessions: { id: number; label: string }[];
};
