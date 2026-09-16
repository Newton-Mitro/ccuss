<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLedgerAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_group_id' => ['required', 'integer', 'exists:account_groups,id'],
            'parent_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])],
            'normal_balance' => ['required', Rule::in(['DEBIT', 'CREDIT'])],
            'is_control_account' => ['nullable', 'boolean'],
            'is_reconcilable' => ['nullable', 'boolean'],
            'is_cash_account' => ['nullable', 'boolean'],
            'is_system' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
