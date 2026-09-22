<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTellerCashTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teller_session_id' => ['required', 'integer', 'exists:teller_sessions,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'reference' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'lines' => ['nullable', 'array', 'min:1'],
            'lines.*.financial_account_id' => [
                'required_with:lines',
                'integer',
                Rule::exists('financial_accounts', 'id')->where(
                    fn($query) => $query->where(
                        'organization_id',
                        $this->attributes->get('active_organization')?->id,
                    ),
                ),
            ],
            'lines.*.amount' => ['required_with:lines', 'numeric', 'gt:0'],
            'lines.*.description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $lines = $this->input('lines', []);

            if (!$lines) {
                return;
            }

            $lineTotal = collect($lines)->sum(fn(array $line): float => (float) ($line['amount'] ?? 0));
            if (abs($lineTotal - (float) $this->input('amount', 0)) > 0.0001) {
                $validator->errors()->add('lines', 'The line amounts must equal the cash amount.');
            }
        });
    }
}
