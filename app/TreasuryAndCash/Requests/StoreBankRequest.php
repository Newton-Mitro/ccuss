<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:banks,code'],
            'name' => ['required', 'string', 'max:150'],
            'short_name' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
