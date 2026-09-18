<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OpenBranchDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_date' => ['required', 'date'],
            'opening_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
