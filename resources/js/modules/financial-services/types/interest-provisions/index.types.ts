export type Provision = {
    id: number;
    period_start: string;
    period_end: string;
    basis_amount: string | number;
    annual_rate: string | number;
    provisioned_amount: string | number;
    status: string;
    financial_account?: { account_no?: string; name?: string };
    product?: { code?: string; name?: string };
};

export type Props = {
    provisions: {
        data: Provision[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
};
