<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePettyCashFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                ),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                'unique:petty_cash_funds,code',
                Rule::unique('cash_locations', 'code')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                ),
            ],
            'name' => ['required', 'string', 'max:150'],
            'fund_limit' => ['required', 'numeric', 'min:0'],
            'current_balance' => ['nullable', 'numeric', 'min:0'],
            'method' => ['nullable', 'in:IMPREST,VARIABLE'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,CLOSED'],
        ];
    }
}
