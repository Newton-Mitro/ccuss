<?php

namespace App\FinancialServices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanRepaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'idempotency_key' => ['nullable', 'uuid'],
            'loan_account_id' => ['required', 'integer', Rule::exists('loan_accounts', 'id')],
            'payout_account_id' => [
                'required',
                'integer',
                Rule::exists('financial_accounts', 'id')->where(fn($query) => $query
                    ->where('organization_id', $organizationId)
                    ->whereIn('account_type', ['CASH', 'BANK'])
                    ->whereIn('status', ['PENDING', 'ACTIVE'])),
            ],
            'amount' => ['required', 'numeric', 'gt:0'],
            'repayment_date' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:100'],
        ];
    }
}