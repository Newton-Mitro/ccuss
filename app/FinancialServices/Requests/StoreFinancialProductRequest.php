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
        $loan = $this->routeIs('loan-products.*') || $this->string('family')->toString() === 'loan';

        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::in($loan ? ['LOAN'] : ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'])],
            'balance_type' => ['required', Rule::in(['ASSET', 'LIABILITY', 'EQUITY'])],
            'base_interest_rate' => ['nullable', 'numeric', 'min:0'],
            'interest_calculation' => ['required', Rule::in(['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])],
            'interest_frequency' => ['required', Rule::in(['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])],
            'terms' => [$loan ? 'prohibited' : 'sometimes', 'array', 'min:1'],
            'terms.*.id' => ['nullable', 'integer'],
            'terms.*.code' => ['required', 'string', 'max:50', 'distinct'],
            'terms.*.name' => ['required', 'string', 'max:150'],
            'terms.*.tenure_value' => ['required', 'integer', 'min:1'],
            'terms.*.tenure_unit' => ['required', Rule::in(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])],
            'terms.*.interest_rate' => ['required', 'numeric', 'min:0'],
            'terms.*.interest_calculation' => ['required', Rule::in(['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])],
            'terms.*.interest_frequency' => ['required', Rule::in(['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])],
            'terms.*.minimum_amount' => ['nullable', 'numeric', 'min:0', 'lte:terms.*.maximum_amount'],
            'terms.*.maximum_amount' => ['nullable', 'numeric', 'min:0', 'gte:terms.*.minimum_amount'],
            'terms.*.status' => ['required', 'boolean'],
            'terms.*.effective_from' => ['nullable', 'date'],
            'terms.*.effective_until' => ['nullable', 'date', 'after_or_equal:terms.*.effective_from'],
            'customer_can_open_multiple_account' => ['nullable', 'boolean'],
            'settings' => ['nullable', 'array'],
            'is_system' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
