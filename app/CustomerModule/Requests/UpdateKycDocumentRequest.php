<?php

namespace App\CustomerModule\Requests;

use App\CustomerModule\Models\KycDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKycDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],
            'document_type' => [
                'sometimes',
                'required',
                Rule::in(KycDocument::DOCUMENT_TYPES),
            ],
            'file' => ['sometimes', 'required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:255'],
            'verification_status' => [
                'sometimes',
                'nullable',
                Rule::in(['PENDING', 'VERIFIED', 'REJECTED']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer is required.',
            'document_type.required' => 'Document type is required.',
            'file.required' => 'A document file is required.',
        ];
    }
}
