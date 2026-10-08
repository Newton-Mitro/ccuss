<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTellerSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_day_id' => ['required', 'integer', 'exists:branch_days,id'],
            'teller_id' => ['required', 'integer', 'exists:tellers,id'],
            'opening_cash' => ['required', 'numeric', 'gte:0'],
            'opening_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
