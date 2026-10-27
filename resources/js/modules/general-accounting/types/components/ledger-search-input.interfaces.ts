import { LedgerAccount } from '@/modules/general-accounting/types/finance_and_accounting';

export interface LedgerSearchInputProps {
    value?: string;
    onSelect?: (ledger: LedgerAccount) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    showErrorText?: boolean;
    disabled?: boolean;
}
