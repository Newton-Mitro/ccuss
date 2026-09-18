<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teller_session_id' => ['required', 'integer', 'exists:teller_sessions,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'type' => ['required', Rule::in(['SHORTAGE', 'EXCESS'])],
            'reason' => ['required', 'string', 'max:2000'],
        ];
    }
}
