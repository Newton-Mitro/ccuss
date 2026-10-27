export type Denomination = {
    id: number;
    currency: string;
    type: string;
    value: string | number;
    name?: string | null;
};

export type Props = {
    counts: {
        data: {
            id: number;
            type: string;
            total_amount: string | number;
            counted_at: string;
            cash_location?: { name?: string };
            denominations?: {
                quantity: number;
                amount: string | number;
                denomination?: {
                    value: string | number;
                    name?: string | null;
                };
            }[];
        }[];
    };
    branchDays: { id: number; business_date: string }[];
    locations: { id: number; name: string; type: string }[];
    denominations: Denomination[];
};
