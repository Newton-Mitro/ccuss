<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseTellerSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'closing_cash' => ['required', 'numeric', 'gte:0'],
            'closing_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
