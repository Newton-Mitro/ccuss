<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $account = $this->route('account');
        $organizationId = $this->attributes->get('active_organization')?->id;

        return [
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('organization_id', $organizationId)],
            'account_name' => ['required', 'string', 'max:200'],
            'account_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('bank_accounts', 'account_number')
                    ->where('organization_id', $organizationId)
                    ->ignore($account?->id),
            ],
            'routing_number' => ['nullable', 'string', 'max:100'],
            'account_type' => ['required', 'in:CURRENT,SAVINGS,FDR,OTHER'],
            'is_reconcilable' => ['boolean'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
