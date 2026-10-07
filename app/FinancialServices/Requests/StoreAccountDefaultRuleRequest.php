<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountDefaultRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $loan = $this->input('account_type') === 'LOAN';
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'financial_product_id' => [
                'nullable',
                'integer',
                Rule::exists($loan ? 'loan_products' : 'deposit_products', 'id')
                    ->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'account_type' => ['required', Rule::in(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'OTHER'])],
            'name' => ['required', 'string', 'max:150'],
            'grace_days' => ['required', 'integer', 'min:0'],
            'fine_calculation' => ['required', Rule::in(['FIXED', 'PERCENTAGE'])],
            'fine_amount' => ['nullable', 'numeric', 'gte:0'],
            'fine_rate' => ['nullable', 'numeric', 'gte:0'],
            'maximum_fine' => ['nullable', 'numeric', 'gte:0'],
            'extends_maturity' => ['boolean'],
            'maturity_extension_days' => ['required', 'integer', 'min:0'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'is_active' => ['boolean'],
        ];
    }
}