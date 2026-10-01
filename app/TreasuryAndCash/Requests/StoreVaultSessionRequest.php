<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaultSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vault_id' => ['required', 'integer', 'exists:vaults,id'],
            'opening_cash' => ['required', 'numeric', 'gte:0'],
            'opening_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
