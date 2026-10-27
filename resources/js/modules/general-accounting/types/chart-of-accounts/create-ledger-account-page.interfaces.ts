export interface AccountGroupOption {
    id: number;
    code: string;
    name: string;
}

export interface ParentAccountOption {
    id: number;
    code: string;
    name: string;
}

export interface Props {
    accountGroups?: AccountGroupOption[];
    parents?: ParentAccountOption[];
}
