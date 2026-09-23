<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'idempotency_key' => ['nullable', 'uuid'],
            'source_account_id' => [
                'required',
                'integer',
                Rule::exists('financial_accounts', 'id')->where(fn($query) => $query
                    ->where('organization_id', $organizationId)
                    ->whereIn('status', ['PENDING', 'ACTIVE'])),
            ],
            'destination_account_id' => [
                'required',
                'integer',
                'different:source_account_id',
                Rule::exists('financial_accounts', 'id')->where(fn($query) => $query
                    ->where('organization_id', $organizationId)
                    ->whereIn('status', ['PENDING', 'ACTIVE'])),
            ],
            'transaction_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}