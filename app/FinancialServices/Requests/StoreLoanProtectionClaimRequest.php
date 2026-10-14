<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanProtectionClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'death_date' => ['required', 'date', 'before_or_equal:today'],
            'death_certificate' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}