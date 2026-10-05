<?php

namespace App\TreasuryAndCash\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $transferType = $this->route('transferType', 'TELLER_TO_TELLER');
        $bankSourceTransfer = $transferType === 'BANK_TO_VAULT';
        $bankDestinationTransfer = $transferType === 'VAULT_TO_BANK';
        $bankTransfer = $bankSourceTransfer || $bankDestinationTransfer;
        $destinationRules = [
            $bankDestinationTransfer ? 'nullable' : 'required',
            'integer',
        ];
        if (!$bankDestinationTransfer) {
            $destinationRules[] = 'different:from_cash_location_id';
        }
        $destinationRules[] = 'exists:cash_locations,id';

        return [
            'from_cash_location_id' => [
                $bankSourceTransfer ? 'nullable' : 'required',
                'integer',
                'exists:cash_locations,id',
            ],
            'to_cash_location_id' => $destinationRules,
            'bank_account_id' => [
                $bankTransfer ? 'required' : 'nullable',
                'integer',
                'exists:bank_accounts,id',
            ],
            'amount' => ['required', 'numeric', 'gt:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
