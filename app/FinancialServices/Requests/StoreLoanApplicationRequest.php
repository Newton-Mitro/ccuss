<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'customer_id' => ['required', 'integer', Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'financial_product_id' => ['required', 'integer', Rule::exists('financial_products', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)->where('category', 'LOAN')->where('status', true))],
            'requested_amount' => ['required', 'numeric', 'gt:0'],
            'requested_term_months' => ['required', 'integer', 'min:1', 'max:600'],
            'purpose' => ['nullable', 'string', 'max:5000'],
        ];
    }
}