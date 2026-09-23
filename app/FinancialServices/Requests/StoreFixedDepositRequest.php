<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFixedDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'principal_amount' => ['required', 'numeric', 'gt:0'],
            'contractual_rate' => ['required', 'numeric', 'gte:0'],
            'term_months' => ['required', 'integer', 'min:1', 'max:600'],
            'started_at' => ['required', 'date'],
            'maturity_instruction' => ['required', Rule::in(['PAYOUT', 'RENEW_PRINCIPAL', 'RENEW_PRINCIPAL_AND_INTEREST'])],
        ];
    }
}