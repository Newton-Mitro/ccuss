export interface Party {
    id: number;
    code: string;
    name: string;
    party_type: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    status: boolean;
}

export interface Props {
    party?: Party;
}
