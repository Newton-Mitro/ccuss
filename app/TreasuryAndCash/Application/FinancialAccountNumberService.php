<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\CashLocation;

class FinancialAccountNumberService
{
    public function ensurePrefixedNumber(FinancialAccount $financialAccount): FinancialAccount
    {
        $managedBy = data_get($financialAccount->metadata, 'managed_by');
        if (! in_array($managedBy, ['cash_location', 'bank_account', 'petty_cash'], true)
            && ! str_starts_with((string) $financialAccount->account_no, 'CASH-LOCATION-')) {
            return $financialAccount;
        }

        $prefix = $this->prefixFor($financialAccount, $managedBy);
        $expectedNumber = $prefix.'-'.str_pad((string) $financialAccount->id, 5, '0', STR_PAD_LEFT);
        if ($financialAccount->account_no === $expectedNumber) {
            return $financialAccount;
        }

        $sequence = $financialAccount->id;
        $accountNumber = $expectedNumber;
        while (
            FinancialAccount::query()
                ->where('organization_id', $financialAccount->organization_id)
                ->where('account_no', $accountNumber)
                ->where('id', '!=', $financialAccount->id)
                ->exists()
        ) {
            $sequence++;
            $accountNumber = $prefix.'-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
        }

        $financialAccount->update(['account_no' => $accountNumber]);

        return $financialAccount->fresh();
    }

    private function prefixFor(FinancialAccount $financialAccount, ?string $managedBy): string
    {
        if ($managedBy === 'bank_account') {
            return 'BANK';
        }

        $cashLocationId = data_get($financialAccount->metadata, 'cash_location_id');
        $cashLocation = $cashLocationId
            ? CashLocation::query()->find($cashLocationId)
            : CashLocation::query()->where('financial_account_id', $financialAccount->id)->first();

        return match ($cashLocation?->type) {
            'TELLER' => 'TELLER',
            'VAULT' => 'VAULT',
            'PETTY_CASH' => 'PETTY-CASH',
            default => 'CASH',
        };
    }
}
