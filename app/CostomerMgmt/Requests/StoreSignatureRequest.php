<?php

namespace App\CostomerMgmt\Requests;


use Illuminate\Foundation\Http\FormRequest;

class StoreSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // adjust if you have policies
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'signature_id' => ['required', 'exists:media,id'],
        ];
    }
}
