<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialAccountHolderRequest extends FormRequest
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
                'sometimes',
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
            'role' => ['required', Rule::in(['PRIMARY', 'JOINT'])],
            'ownership_percent' => ['required', 'numeric', 'gt:0', 'lte:100'],
            'guardian_customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)),
            ],
        ];
    }
}