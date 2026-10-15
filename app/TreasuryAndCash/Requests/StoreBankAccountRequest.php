<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'account_name' => ['required', 'string', 'max:200'],
            'account_number' => ['required', 'string', 'max:100'],
            'routing_number' => ['nullable', 'string', 'max:100'],
            'account_type' => ['required', 'in:CURRENT,SAVINGS,FDR,OTHER'],
            'opening_balance' => ['required', 'numeric', 'gte:0'],
            'opening_counterpart_account_id' => [
                Rule::requiredIf((float) $this->input('opening_balance', 0) > 0),
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $this->attributes->get('active_organization')?->id)
                    ->where('status', true)
                    ->where('code', '!=', '1200')),
            ],
            'is_reconcilable' => ['boolean'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
