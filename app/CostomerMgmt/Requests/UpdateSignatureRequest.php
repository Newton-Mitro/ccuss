<?php

namespace App\CostomerMgmt\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'signature_id' => ['required', 'exists:media,id'],
        ];
    }
}
