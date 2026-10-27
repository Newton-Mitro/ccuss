import { FiscalYear } from '@/modules/general-accounting/types/finance_and_accounting';
import type { EquityLine } from '@/modules/general-accounting/types/reports/shareholders-equity-page.types';
import { SharedData } from '@/types';

export interface Props extends SharedData {
    equityStatement: EquityLine[];
    fiscalYears: FiscalYear[];
    selectedFiscalYear?: number;
}
