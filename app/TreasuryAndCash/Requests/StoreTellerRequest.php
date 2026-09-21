<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTellerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'maximum_cash' => ['nullable', 'numeric', 'gte:0'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
