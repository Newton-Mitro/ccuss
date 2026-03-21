<?php

namespace App\CustomerModule\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Allow authenticated users to create
    }

    public function rules(): array
    {
        return [
            /* ================= Core ================= */
            'type' => ['required', Rule::in(['INDIVIDUAL', 'ORGANIZATION'])],
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],

            /* ================= KYC & Status ================= */
            'kyc_status' => ['nullable', Rule::in(['PENDING', 'VERIFIED', 'REJECTED'])],

            /* ================= Personal Info ================= */
            'dob' => [
                'nullable',
                'date',
                'required_if:type,INDIVIDUAL',
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
                Rule::in(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE', 'REGISTRATION_NO']),
            ],
            'identification_number' => ['required', 'string', 'max:50'],

            /* ================= Relations / Optional ================= */
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],

            /* ================= Audit (Optional) ================= */
            'created_by' => ['nullable', 'integer', 'exists:users,id'],
            'updated_by' => ['nullable', 'integer', 'exists:users,id'],
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