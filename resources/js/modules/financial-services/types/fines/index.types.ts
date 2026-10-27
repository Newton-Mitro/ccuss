export type Fine = {
    id: number;
    assessed_amount: string | number;
    paid_amount: string | number;
    waived_amount: string | number;
    status: string;
    assessed_at: string;
    financial_account?: { account_no?: string; name?: string };
    default_event?: { rule?: { name?: string } };
};

export type Props = {
    fines: {
        data: Fine[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
};
