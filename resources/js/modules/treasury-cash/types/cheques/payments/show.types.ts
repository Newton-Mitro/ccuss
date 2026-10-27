import type { SharedData } from '@/types';

export type Actor = {
    id: number;
    name: string;
} | null;

export type Event = {
    id: number;
    action: string;
    reason?: string | null;
    created_at: string;
    performed_by?: Actor;
};

export type Signatory = {
    id: number;
    name: string;
    detail: string;
    eligible: boolean;
    transaction_limit: number | null;
    signature: {
        url: string;
        verification_status: string;
    } | null;
};

export type Payment = {
    id: number;
    status: string;
    amount: string | number;
    note?: string | null;
    return_reason?: string | null;
    checks?: Record<string, boolean> | null;
    created_at: string;

    cheque: {
        cheque_no: string;
        cheque_date?: string | null;
        payee?: string | null;
        status: string;
    };

    financial_account: {
        account_no: string;
        name?: string | null;
        status: string;
    };

    teller_session?: {
        teller?: {
            name: string;
        } | null;
    } | null;

    signatory?: {
        name: string;
    } | null;

    received_by?: Actor;
    verified_by?: Actor;
    approved_by?: Actor;
    paid_by?: Actor;

    financial_transaction?: {
        transaction_no?: string;
        reference?: string;
    } | null;

    events: Event[];
};

export type Props = SharedData & {
    payment: Payment;

    account_check: {
        status: string;
        available_balance: number;
        balance_sufficient: boolean;
    };

    signatories: Signatory[];
};
