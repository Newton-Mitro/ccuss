<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialAccountAuthorizedPersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'authorization_type' => ['required', Rule::in(['SIGNATORY', 'OPERATOR', 'VIEWER'])],
            'designation' => ['nullable', 'string', 'max:100'],
            'transaction_limit' => ['nullable', 'numeric', 'gte:0'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'is_active' => ['sometimes', 'boolean'],
            'note' => ['nullable', 'string'],
        ];
    }
}