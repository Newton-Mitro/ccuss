<?php

namespace App\CostomerManagement\Customer\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // set to true if any authenticated user can create
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['Individual', 'Organization'])],
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'kyc_level' => ['nullable', Rule::in(['MIN', 'STD', 'ENH'])],
            'status' => ['nullable', Rule::in(['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])],

            // Personal info
            'dob' => ['nullable', 'date'],
            'gender' => ['required', Rule::in(['MALE', 'FEMALE', 'OTHER'])],
            'religion' => ['required', Rule::in(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])],

            'identification_type' => ['required', Rule::in(['NID', 'NBR', 'PASSPORT', 'DRIVING_LICENSE'])],
            'identification_number' => ['required', 'string', 'max:50'],
            'photo_id' => ['nullable', 'exists:media,id'],

            // Organization info
            'registration_no' => ['nullable', 'string', 'max:150'],
        ];
    }
}
