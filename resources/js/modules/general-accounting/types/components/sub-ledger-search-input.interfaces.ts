export interface SubLedger {
    id: number;
    name: string;
    ledger_code?: string;
    ledger_type?: string;
    status?: string;
}

export interface SubLedgerSearchInputProps {
    onSelect?: (ledger: SubLedger) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    value?: string;
    error?: string;
    showErrorText?: boolean;
}
