import { VoucherLine } from '@/modules/general-accounting/types/finance_and_accounting';

/* -------------------------------------------------------
 | Types
 ------------------------------------------------------- */
export interface VoucherFormData {
    voucher_no: string;
    voucher_date: string;
    voucher_type: string;
    fiscal_year_id?: number;
    fiscal_period_id?: number;
    branch_id?: number;
    status: string;
    narration: string;
    cash_ledger_id?: number;
    cash_subledger_id?: number;
    lines: VoucherLine[];
}
