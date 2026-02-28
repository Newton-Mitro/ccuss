<?php

namespace App\Accounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_date' => ['required', 'date'],

            'voucher_type' => [
                'required',
                Rule::in([
                    'OPENING_BALANCE',       // Initial balance of accounts
                    'CLOSING_BALANCE',       // Closing balance (optional)
                    'CREDIT_OR_RECEIPT',     // Cash/bank inflow
                    'DEBIT_OR_PAYMENT',      // Cash/bank outflow
                    'JOURNAL_OR_NON_CASH',   // Non-cash adjustments / transfers
                    'PURCHASE',              // Purchase invoice
                    'SALE',                  // Sales invoice
                    'DEBIT_NOTE',            // Adjustment reducing payable
                    'CREDIT_NOTE',           // Adjustment reducing receivable
                    'CONTRA',                // Bank/Cash transfer within accounts
                ]),
            ],

            'fiscal_year_id' => ['required', 'exists:fiscal_years,id'],
            'fiscal_period_id' => ['required', 'exists:fiscal_periods,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'status' => ['required', 'string'],
            'narration' => ['required', 'string'],
            'reference' => ['nullable', 'string'],

            // Conditional required
            'cash_ledger_id' => [
                Rule::requiredIf(function () {
                    return in_array($this->voucher_type, ['CREDIT_OR_RECEIPT', 'DEBIT_OR_PAYMENT']);
                }),
            ],
            'cash_subledger_id' => [
                Rule::requiredIf(function () {
                    return in_array($this->voucher_type, ['CREDIT_OR_RECEIPT', 'DEBIT_OR_PAYMENT']);
                }),
            ],

            'lines' => ['required', 'array', 'min:1'],

            'lines.*.id' => [
                'nullable',
                'exists:voucher_lines,id',
            ],

            'lines.*.ledger_account_id' => [
                'required',
                'exists:ledger_accounts,id',
            ],

            'lines.*.debit' => ['nullable', 'numeric', 'min:0'],
            'lines.*.credit' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}