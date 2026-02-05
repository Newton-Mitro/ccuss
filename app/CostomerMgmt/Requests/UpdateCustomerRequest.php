<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'gender' => ['nullable', Rule::in(['MALE', 'FEMALE', 'OTHER'])],
            'religion' => ['nullable', Rule::in(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])],

            'identification_type' => ['required', Rule::in(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE'])],
            'identification_number' => ['required', 'string', 'max:50'],
            'photo_id' => ['nullable', 'exists:media,id'],

            // Organization info
            'registration_no' => ['nullable', 'string', 'max:150'],
        ];
    }
}
