<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShareAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_since' => ['nullable', 'date'],
            'membership_no' => ['nullable', 'string', 'max:100'],
            'membership_status' => ['required', 'in:PENDING,ACTIVE,SUSPENDED,CLOSED'],
        ];
    }
}