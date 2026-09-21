<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'maximum_balance' => ['nullable', 'numeric', 'gte:0'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
