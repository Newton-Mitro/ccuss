export type Declaration = {
    id: number;
    declaration_no: string;
    declaration_date: string;
    dividend_rate: string | number;
    total_basis_amount: string | number;
    total_dividend_amount: string | number;
    status: string;
    note?: string;
    allocations?: {
        id: number;
        basis_amount: string | number;
        dividend_amount: string | number;
        status: string;
    }[];
};

export type Props = {
    declarations: {
        data: Declaration[];
        links: { url: string | null; label: string; active: boolean }[];
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; page?: number; per_page?: number };
};
