<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDepositNomineeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where(fn($query) => $query->where('organization_id', (int) $this->attributes->get('active_organization')?->id)),
            ],
            'name' => ['required', 'string', 'max:150'],
            'relationship' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identification_type' => ['nullable', 'string', 'max:100'],
            'identification_number' => ['nullable', 'string', 'max:100'],
            'share_percent' => ['required', 'numeric', 'gt:0', 'lte:100'],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}