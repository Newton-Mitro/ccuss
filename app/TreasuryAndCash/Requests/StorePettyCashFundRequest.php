<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePettyCashFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cash_location_id' => ['required', 'integer', 'exists:cash_locations,id'],
            'code' => ['required', 'string', 'max:50', 'unique:petty_cash_funds,code'],
            'name' => ['required', 'string', 'max:150'],
            'fund_limit' => ['required', 'numeric', 'min:0'],
            'current_balance' => ['nullable', 'numeric', 'min:0'],
            'method' => ['nullable', 'in:IMPREST,VARIABLE'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
