<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'installment_amount' => ['required', 'numeric', 'gt:0'],
            'installment_frequency' => ['required', Rule::in(['WEEKLY', 'MONTHLY', 'QUARTERLY'])],
            'total_installments' => ['required', 'integer', 'min:1', 'max:600'],
            'started_at' => ['required', 'date'],
            'maturity_extension_days' => ['nullable', 'integer', 'min:0'],
            'grace_days' => ['nullable', 'integer', 'min:0'],
        ];
    }
}