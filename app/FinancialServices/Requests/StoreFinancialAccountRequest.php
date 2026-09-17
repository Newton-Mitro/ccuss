<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'financial_product_id' => [
                'nullable',
                'integer',
                Rule::exists('financial_products', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'holder_type' => ['nullable', Rule::in(['customer'])],
            'holder_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'account_no' => ['required', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:200'],
            'account_type' => ['required', Rule::in(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK', 'OTHER'])],
            'metadata' => ['nullable', 'array'],
        ];
    }
}