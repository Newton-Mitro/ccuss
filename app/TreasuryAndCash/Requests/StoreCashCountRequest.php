<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashCountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_day_id' => ['required', 'integer', 'exists:branch_days,id'],
            'cash_location_id' => ['required', 'integer', 'exists:cash_locations,id'],
            'teller_session_id' => ['nullable', 'integer', 'exists:teller_sessions,id'],
            'type' => ['required', Rule::in(['OPENING', 'CLOSING', 'TRANSFER_OUT', 'TRANSFER_IN', 'VERIFICATION', 'ADJUSTMENT'])],
            'note' => ['nullable', 'string', 'max:2000'],
            'denominations' => ['required', 'array', 'min:1'],
            'denominations.*.cash_denomination_id' => ['required', 'integer', 'exists:cash_denominations,id'],
            'denominations.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}