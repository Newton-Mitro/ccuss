<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::in(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'OTHER'])],
            'balance_type' => ['required', Rule::in(['ASSET', 'LIABILITY', 'EQUITY'])],
            'interest_rate' => ['nullable', 'numeric', 'min:0'],
            'interest_calculation' => ['required', Rule::in(['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])],
            'interest_frequency' => ['required', Rule::in(['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])],
            'settings' => ['nullable', 'array'],
            'is_system' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}