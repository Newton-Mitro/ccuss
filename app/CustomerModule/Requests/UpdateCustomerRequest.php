<?php

namespace App\CustomerModule\Requests;

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
            /* ================= Core ================= */
            'type' => ['required', Rule::in(['INDIVIDUAL', 'ORGANIZATION'])],
            'name' => ['required', 'string', 'max:150'],
            'primary_phone' => ['nullable', 'string', 'max:50'],
            'primary_email' => ['nullable', 'email', 'max:100'],
            'alternate_phone' => ['nullable', 'string', 'max:50'],
            'alternate_email' => ['nullable', 'email', 'max:100'],

            /* ================= KYC & Status ================= */
            'status' => ['nullable', Rule::in(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'])],

            /* ================= Personal Info ================= */
            'dob' => [
                'nullable',
                'date',
                'required_if:type,individual',
            ],
            'gender' => [
                'nullable',
                Rule::in(['MALE', 'FEMALE', 'OTHER']),
                'required_if:type,INDIVIDUAL',
            ],
            'marital_status' => [
                'nullable',
                Rule::in(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'OTHER']),
            ],
            'blood_group' => [
                'nullable',
                Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            ],
            'nationality' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'education' => ['nullable', 'string', 'max:100'],
            'religion' => [
                'nullable',
                Rule::in([
                    'CHRISTIANITY',
                    'ISLAM',
                    'HINDUISM',
                    'BUDDHISM',
                    'OTHER',
                ]),
            ],

            /* ================= Identification ================= */
            'identification_type' => [
                'required',
                Rule::in(['NATIONAL_IDENTIFICATION_NUMBER', 'BIRTH_REGISTRATION_NUMBER', 'PASSPORT', 'DRIVING_LICENSE', 'REGISTRATION_NO']),
            ],
            'identification_number' => ['required', 'string', 'max:50'],

            /* ================= Relations / Optional ================= */
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'dob.required_if' => 'Date of birth is required for individual customers.',
            'gender.required_if' => 'Gender is required for individual customers.',
        ];
    }
}