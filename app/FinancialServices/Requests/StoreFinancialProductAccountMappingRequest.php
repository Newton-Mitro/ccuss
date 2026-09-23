<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialProductAccountMappingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;
        $mappingId = $this->route('mapping')?->id;

        return [
            'transaction_type' => [
                'required',
                'string',
                'max:50',
                Rule::unique('financial_product_account_mappings', 'transaction_type')
                    ->where(fn($query) => $query->where('financial_product_id', $this->route('financial_product')?->id))
                    ->ignore($mappingId),
            ],
            'debit_account_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'credit_account_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'status' => ['nullable', 'boolean'],
        ];
    }
}