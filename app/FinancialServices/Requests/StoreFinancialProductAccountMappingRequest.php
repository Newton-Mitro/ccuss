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
        $mappingId = $this->route('mapping');
        $family = $this->routeIs('loan-products.*', 'loan-product-account-mappings.*') || $this->string('family')->toString() === 'loan'
            ? 'loan'
            : 'deposit';
        $productId = $this->route('financial_product');
        $mappingTable = $family === 'loan' ? 'loan_product_account_mappings' : 'deposit_product_account_mappings';
        $productKey = $family === 'loan' ? 'loan_product_id' : 'deposit_product_id';

        return [
            'transaction_type' => [
                'required',
                'string',
                'max:50',
                Rule::unique($mappingTable, 'transaction_type')
                    ->where(fn($query) => $query->where($productKey, $productId))
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