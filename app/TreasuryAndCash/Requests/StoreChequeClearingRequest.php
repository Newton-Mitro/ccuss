<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChequeClearingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['cheque_id' => ['required', 'integer', 'exists:cheques,id'], 'branch_id' => ['required', 'integer', 'exists:branches,id'], 'clearing_no' => ['required', 'string', 'max:100'], 'drawer_bank_name' => ['nullable', 'string', 'max:150'], 'drawer_bank_branch' => ['nullable', 'string', 'max:150'], 'drawer_account_no' => ['nullable', 'string', 'max:100']];
    }
}