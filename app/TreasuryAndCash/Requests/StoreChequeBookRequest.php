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
            'bank_account_id' => ['required', 'integer', Rule::exists('bank_accounts', 'id')->where(fn($query) => $query->where('organization_id', $organizationId))],
            'book_no' => ['required', 'string', 'max:100'],
            'prefix' => ['nullable', 'string', 'max:50'],
            'start_number' => ['required', 'integer', 'min:1'],
            'end_number' => ['required', 'integer', 'gt:start_number'],
            'issued_date' => ['nullable', 'date'],
        ];
    }
}