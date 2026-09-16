<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fiscal_period_id' => ['required', 'integer', 'exists:fiscal_periods,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'voucher_type' => ['required', Rule::in(['JOURNAL', 'PAYMENT', 'RECEIPT', 'CONTRA', 'OPENING', 'ADJUSTMENT', 'CLOSING', 'SYSTEM'])],
            'voucher_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
            'entries' => ['required', 'array', 'min:2'],
            'entries.*.account_id' => ['required', 'integer', 'exists:accounts,id'],
            'entries.*.branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'entries.*.cost_center_id' => ['nullable', 'integer', 'exists:cost_centers,id'],
            'entries.*.description' => ['nullable', 'string', 'max:500'],
            'entries.*.debit' => ['nullable', 'numeric', 'min:0'],
            'entries.*.credit' => ['nullable', 'numeric', 'min:0'],
            'entries.*.reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
