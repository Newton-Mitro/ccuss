<?php

namespace App\CostomerManagement\Address\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Add logic if needed, e.g., check user permissions
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],

            'line1' => ['sometimes', 'required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],

            'division' => ['sometimes', 'required', 'string', 'max:100'],
            'district' => ['sometimes', 'required', 'string', 'max:100'],
            'upazila' => ['nullable', 'string', 'max:100'],
            'union_ward' => ['nullable', 'string', 'max:100'],
            'village_locality' => ['nullable', 'string', 'max:150'],
            'postal_code' => ['nullable', 'string', 'max:20'],

            'country_code' => ['sometimes', 'required', 'string', 'size:2'],

            'type' => ['sometimes', 'required', 'in:CURRENT,PERMANENT,MAILING,WORK,REGISTERED,OTHER'],
        ];
    }

    /**
     * Customize the validation messages.
     */
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