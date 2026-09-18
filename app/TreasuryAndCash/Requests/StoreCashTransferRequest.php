<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_cash_location_id' => ['required', 'integer', 'exists:cash_locations,id'],
            'to_cash_location_id' => ['required', 'integer', 'different:from_cash_location_id', 'exists:cash_locations,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
