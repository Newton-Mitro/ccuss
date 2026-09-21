<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_account_id' => ['required', 'integer', 'exists:bank_accounts,id'],
            'type' => ['required', 'in:DEPOSIT,WITHDRAWAL,TRANSFER_IN,TRANSFER_OUT,CHARGE,INTEREST,ADJUSTMENT'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
