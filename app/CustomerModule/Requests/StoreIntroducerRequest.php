<?php

namespace App\CustomerModule\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIntroducerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'introduced_customer_id' => ['required', 'exists:customers,id'],
            'introducer_customer_id' => [
                'nullable',
                'exists:customers,id',
                'different:introduced_customer_id',
            ],
            'introducer_account_id' => [
                'nullable',
                'exists:accounts,id',
            ],
            'relationship_type' => [
                'required',
                Rule::in(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER']),
            ],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'introduced_customer_id.required' => 'Introduced customer is required.',
            'introducer_customer_id.different' => 'Introducer customer must be different from the introduced customer.',
            'relationship_type.required' => 'Relationship type is required.',
        ];
    }
}
