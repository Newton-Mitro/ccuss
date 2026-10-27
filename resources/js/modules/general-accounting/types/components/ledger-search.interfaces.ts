export interface LedgerItem {
    id: number;
    name: string;
    code?: string;
    full_display?: string;
}

export interface LedgerSearchProps {
    query: string;
    onQueryChange: (value: string) => void;
    onSelect: (ledger: LedgerItem) => void;
    api?: string;
    error?: string;
    placeholder?: string;
}
