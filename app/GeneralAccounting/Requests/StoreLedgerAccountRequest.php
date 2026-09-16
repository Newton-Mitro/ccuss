<?php

namespace App\GeneralAccounting\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLedgerAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'account_group_id' => [
                'required',
                'integer',
                Rule::exists('account_groups', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])],
            'normal_balance' => ['required', Rule::in(['DEBIT', 'CREDIT'])],
            'is_control_account' => ['nullable', 'boolean'],
            'is_reconcilable' => ['nullable', 'boolean'],
            'is_cash_account' => ['nullable', 'boolean'],
            'is_system' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
