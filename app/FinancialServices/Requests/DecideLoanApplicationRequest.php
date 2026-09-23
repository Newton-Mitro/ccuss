<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DecideLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'approved_amount' => ['nullable', 'numeric', 'gt:0'],
            'decision_note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}