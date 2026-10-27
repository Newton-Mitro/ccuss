import { LedgerAccount } from '@/modules/general-accounting/types/finance_and_accounting';

export interface CashLedgerSearchInputProps {
    onSelect: (ledger: LedgerAccount) => void;
    label?: string;
    placeholder?: string;
}
