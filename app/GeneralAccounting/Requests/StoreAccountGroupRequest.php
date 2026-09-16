<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:account_groups,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])],
            'normal_balance' => ['required', Rule::in(['DEBIT', 'CREDIT'])],
            'is_system' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
