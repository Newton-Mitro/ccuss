<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePettyCashTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'petty_cash_fund_id' => ['required', 'integer', 'exists:petty_cash_funds,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payee' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'expense_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
        ];
    }
}
