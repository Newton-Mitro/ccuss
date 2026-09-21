<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialProductPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach ([
            'deposit_amount_rules',
            'tenure_rules',
            'loan_ceiling_rules',
            'repayment_rules',
            'eligibility_rules',
            'security_rules',
            'documentation_requirements',
            'maturity_examples',
        ] as $field) {
            if (is_string($this->input($field)) && trim($this->input($field)) !== '') {
                $decoded = json_decode($this->input($field), true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->merge([$field => $decoded]);
                }
            }
        }
    }

    public function rules(): array
    {
        return [
            'minimum_opening_amount' => ['nullable', 'numeric', 'min:0'],
            'minimum_deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_deposit_amount' => ['nullable', 'numeric', 'gte:minimum_deposit_amount'],
            'maximum_loan_amount' => ['nullable', 'numeric', 'min:0'],
            'loan_to_value_percent' => ['nullable', 'numeric', 'between:0,100'],
            'interest_rebate_percent' => ['nullable', 'numeric', 'between:0,100'],
            'deposit_amount_rules' => ['nullable', 'array'],
            'tenure_rules' => ['nullable', 'array'],
            'loan_ceiling_rules' => ['nullable', 'array'],
            'repayment_rules' => ['nullable', 'array'],
            'eligibility_rules' => ['nullable', 'array'],
            'security_rules' => ['nullable', 'array'],
            'documentation_requirements' => ['nullable', 'array'],
            'maturity_examples' => ['nullable', 'array'],
            'source_url' => ['nullable', 'url', 'max:500'],
            'source_checked_at' => ['nullable', 'date'],
            'effective_from' => ['nullable', 'date'],
            'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'version' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(['DRAFT', 'ACTIVE', 'RETIRED'])],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
