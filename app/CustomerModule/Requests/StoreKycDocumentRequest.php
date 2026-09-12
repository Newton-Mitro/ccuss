<?php

namespace App\CustomerModule\Requests;

use App\CustomerModule\Models\KycDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKycDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'document_type' => [
                'required',
                Rule::in(KycDocument::DOCUMENT_TYPES),
            ],
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'alt_text' => ['nullable', 'string', 'max:255'],
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
