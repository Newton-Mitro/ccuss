<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanProtectionProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;
        $productId = $this->route('loan_protection_product')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:60',
                Rule::unique('loan_protection_products', 'code')
                    ->where(fn($query) => $query->where('organization_id', $organizationId))
                    ->ignore($productId),
            ],
            'name' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'monthly_rate_percent' => ['required', 'numeric', 'gte:0', 'lte:100'],
            'status' => ['required', 'boolean'],
        ];
    }
}