<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanProtectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'required' => ['boolean'],
            'coverage_amount' => ['nullable', 'numeric', 'gte:0'],
            'initial_fee' => ['nullable', 'numeric', 'gte:0'],
            'renewal_fee' => ['nullable', 'numeric', 'gte:0'],
            'renewal_frequency' => ['required', Rule::in(['NONE', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'])],
            'next_renewal_at' => ['nullable', 'date'],
        ];
    }
}