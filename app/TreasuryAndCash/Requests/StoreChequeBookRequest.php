<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChequeBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationId = (int) $this->attributes->get('active_organization')?->id;

        return [
            'financial_account_id' => ['nullable', 'integer', Rule::exists('financial_accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId)->where('account_type', 'SAVINGS'))],
            'bank_account_id' => ['nullable', 'integer', Rule::exists('bank_accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'book_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('cheque_books', 'book_no')
                    ->where(fn($query) => $query->where('financial_account_id', $this->input('financial_account_id'))),
            ],
            'prefix' => ['nullable', 'string', 'max:50'],
            'start_number' => ['required', 'integer', 'min:1'],
            'end_number' => ['required', 'integer', 'gt:start_number'],
            'issued_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'book_no.unique' => 'This book number is already used for the selected savings account.',
        ];
    }
}