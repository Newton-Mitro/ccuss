<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_id' => ['required', 'integer', 'exists:banks,id'],
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'account_name' => ['required', 'string', 'max:200'],
            'account_number' => ['required', 'string', 'max:100'],
            'routing_number' => ['nullable', 'string', 'max:100'],
            'account_type' => ['required', 'in:CURRENT,SAVINGS,FDR,OTHER'],
            'opening_balance' => ['required', 'numeric', 'gte:0'],
            'is_reconcilable' => ['boolean'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
