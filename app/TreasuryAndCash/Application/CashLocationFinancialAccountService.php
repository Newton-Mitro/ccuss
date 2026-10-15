<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\CashLocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CashLocationFinancialAccountService
{
    public function ensureLinked(CashLocation $cashLocation, float|int|string|null $openingBalance = null): FinancialAccount
    {
        return DB::transaction(function () use ($cashLocation, $openingBalance): FinancialAccount {
            $cashLocation = CashLocation::query()
                ->whereKey($cashLocation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($cashLocation->financial_account_id) {
                $financialAccount = $cashLocation->financialAccount()->first();

                if (
                    ! $financialAccount
                    || (int) $financialAccount->organization_id !== (int) $cashLocation->organization_id
                    || $financialAccount->account_type !== 'CASH'
                    || $financialAccount->status !== 'ACTIVE'
                ) {
                    throw new RuntimeException('The cash location must be linked to an active cash financial account in the same organization.');
                }

                $financialAccount = $this->initializeManagedBalance($financialAccount, $openingBalance);

                return $this->ensureNumericAccountNumber($financialAccount);
            }

            $balance = (float) ($openingBalance ?? 0);
            $financialAccount = FinancialAccount::query()->create([
                'organization_id' => $cashLocation->organization_id,
                'branch_id' => $cashLocation->branch_id,
                'product_type' => null,
                'product_id' => null,
                'holder_type' => null,
                'holder_id' => null,
                'account_no' => 'CASH-LOCATION-'.Str::uuid(),
                'name' => $cashLocation->name,
                'account_type' => 'CASH',
                'status' => 'ACTIVE',
                'balance' => $balance,
                'available_balance' => $balance,
                'interest_accrued' => 0,
                'opened_at' => now()->toDateString(),
                'metadata' => [
                    'managed_by' => 'cash_location',
                    'cash_location_id' => $cashLocation->id,
                    'cash_balance_initialized' => $openingBalance !== null,
                ],
            ]);

            $cashLocation->update(['financial_account_id' => $financialAccount->id]);

            return $this->ensureNumericAccountNumber($financialAccount);
        });
    }

    private function ensureNumericAccountNumber(FinancialAccount $financialAccount): FinancialAccount
    {
        if (
            data_get($financialAccount->metadata, 'managed_by') !== 'cash_location'
            && ! str_starts_with((string) $financialAccount->account_no, 'CASH-LOCATION-')
        ) {
            return $financialAccount;
        }

        if (ctype_digit((string) $financialAccount->account_no)) {
            return $financialAccount;
        }

        $accountNumber = (string) $financialAccount->id;
        while (
            FinancialAccount::query()
                ->where('organization_id', $financialAccount->organization_id)
                ->where('account_no', $accountNumber)
                ->where('id', '!=', $financialAccount->id)
                ->exists()
        ) {
            $accountNumber = (string) ((int) $accountNumber + 1);
        }

        $financialAccount->update(['account_no' => $accountNumber]);

        return $financialAccount->fresh();
    }

    private function initializeManagedBalance(FinancialAccount $financialAccount, float|int|string|null $openingBalance): FinancialAccount
    {
        if (
            $openingBalance === null
            || data_get($financialAccount->metadata, 'managed_by') !== 'cash_location'
            || data_get($financialAccount->metadata, 'cash_balance_initialized', false)
        ) {
            return $financialAccount;
        }

        if (
            (float) $financialAccount->balance === 0.0
            && (float) $financialAccount->available_balance === 0.0
            && ! $financialAccount->transactions()->exists()
        ) {
            $balance = (float) $openingBalance;
            $financialAccount->update([
                'balance' => $balance,
                'available_balance' => $balance,
                'metadata' => [
                    ...($financialAccount->metadata ?? []),
                    'cash_balance_initialized' => true,
                ],
            ]);
        }

        return $financialAccount->fresh();
    }
}
