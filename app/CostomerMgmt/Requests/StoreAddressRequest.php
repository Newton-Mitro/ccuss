<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],

            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],

            'division' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'upazila' => ['nullable', 'string', 'max:100'],
            'union_ward' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],

            'country' => ['nullable', 'string', 'size:2'],

            'type' => ['required', 'in:CURRENT,PERMANENT,MAILING,WORK,REGISTERED,OTHER'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer selection is required.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'line1.required' => 'Address line 1 is required.',
            'division.required' => 'Division is required.',
            'district.required' => 'District is required.',
            'type.in' => 'Invalid address type selected.',
        ];
    }
}