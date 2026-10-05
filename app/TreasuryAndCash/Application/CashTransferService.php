<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Support\Facades\DB;

class CashTransferService
{
    public function __construct(
        private readonly BankTransactionService $bankTransactionService,
    ) {
    }

    public function create(
        int $organizationId,
        int $branchId,
        int $userId,
        array $data,
        string $transferType = 'TELLER_TO_TELLER',
    ): CashTransfer {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $data, $transferType) {
            $branchDay = BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->lockForUpdate()
                ->first();

            if (!$branchDay) {
                throw new \RuntimeException('An open branch day is required before creating a cash transfer.');
            }

            [$sourceType, $destinationType] = match ($transferType) {
                'VAULT_TO_TELLER' => ['VAULT', 'TELLER'],
                'TELLER_TO_VAULT' => ['TELLER', 'VAULT'],
                'VAULT_TO_VAULT' => ['VAULT', 'VAULT'],
                'BANK_TO_VAULT' => [null, 'VAULT'],
                'VAULT_TO_BANK' => ['VAULT', null],
                default => ['TELLER', 'TELLER'],
            };

            $locationIds = array_values(array_filter([
                $data['from_cash_location_id'] ?? null,
                $data['to_cash_location_id'] ?? null,
            ]));
            $locations = CashLocation::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->whereIn('id', $locationIds)
                ->get()
                ->keyBy('id');

            $requiredLocationCount = in_array($transferType, ['BANK_TO_VAULT', 'VAULT_TO_BANK'], true) ? 1 : 2;
            if ($locations->count() !== $requiredLocationCount) {
                throw new \RuntimeException('The selected cash locations must belong to the active branch and be active.');
            }

            if (
                ($sourceType !== null && $locations->get($data['from_cash_location_id'] ?? null)?->type !== $sourceType)
                || ($destinationType !== null && $locations->get($data['to_cash_location_id'] ?? null)?->type !== $destinationType)
            ) {
                throw new \RuntimeException('The selected source and destination types do not match this transfer.');
            }

            $bankAccountId = null;
            if (in_array($transferType, ['BANK_TO_VAULT', 'VAULT_TO_BANK'], true)) {
                $bankAccount = BankAccount::query()
                    ->whereKey($data['bank_account_id'] ?? null)
                    ->where('organization_id', $organizationId)
                    ->where(fn($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
                    ->where('status', 'ACTIVE')
                    ->lockForUpdate()
                    ->first();

                if (!$bankAccount) {
                    throw new \RuntimeException('Select an active bank account in the active branch.');
                }

                $bankAccountId = $bankAccount->id;
            }

            $nextNumber = CashTransfer::query()->lockForUpdate()->count() + 1;

            return CashTransfer::create([
                'branch_day_id' => $branchDay->id,
                'from_cash_location_id' => $data['from_cash_location_id'] ?? null,
                'to_cash_location_id' => $data['to_cash_location_id'] ?? null,
                'bank_account_id' => $bankAccountId,
                'amount' => $data['amount'],
                'transfer_no' => 'TRF-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT),
                'transfer_type' => $transferType,
                'status' => 'PENDING',
                'requested_by' => $userId,
                'requested_at' => now(),
                'note' => $data['note'] ?? null,
            ]);
        });
    }

    public function approve(int $organizationId, int $branchId, int $userId, int $transferId): CashTransfer
    {
        $transfer = CashTransfer::query()
            ->whereKey($transferId)
            ->where('status', 'PENDING')
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', BranchDay::STATUS_OPEN);
            })
            ->first();

        if (!$transfer) {
            throw new \RuntimeException('A pending transfer for the active branch and open branch day is required.');
        }

        $transfer->update([
            'status' => 'APPROVED',
            'approved_by' => $userId,
        ]);

        return $transfer->fresh();
    }

    public function complete(int $organizationId, int $branchId, int $transferId, int $userId): CashTransfer
    {
        return DB::transaction(function () use ($organizationId, $branchId, $transferId, $userId) {
            $transfer = CashTransfer::query()
                ->whereKey($transferId)
                ->where('status', 'APPROVED')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', BranchDay::STATUS_OPEN);
                })
                ->with(['fromCashLocation', 'toCashLocation'])
                ->lockForUpdate()
                ->first();

            if (!$transfer) {
                throw new \RuntimeException('An approved transfer for the active branch and open branch day is required.');
            }

            $amount = (float) $transfer->amount;
            if ($transfer->transfer_type === 'BANK_TO_VAULT') {
                $destinationSession = $this->openSessionForLocation($transfer->toCashLocation, $transfer->branch_day_id);
                $destinationExpected = (float) ($destinationSession->expected_cash ?? $destinationSession->opening_cash);
                $bankTransaction = $this->bankTransactionService->create($organizationId, $branchId, [
                    'bank_account_id' => $transfer->bank_account_id,
                    'type' => 'TRANSFER_OUT',
                    'amount' => $transfer->amount,
                    'transaction_date' => now()->toDateString(),
                    'reference' => $transfer->transfer_no,
                    'description' => $transfer->note ?: 'Bank funding to vault ' . $transfer->toCashLocation->name,
                ]);
                $this->bankTransactionService->post($organizationId, $branchId, $bankTransaction->id, $userId);
                $transfer->bank_transaction_id = $bankTransaction->id;
                $destinationSession->update(['expected_cash' => $destinationExpected + $amount]);
            } elseif ($transfer->transfer_type === 'VAULT_TO_BANK') {
                $sourceSession = $this->openSessionForLocation($transfer->fromCashLocation, $transfer->branch_day_id);
                $sourceExpected = (float) ($sourceSession->expected_cash ?? $sourceSession->opening_cash);
                if ($sourceExpected < $amount) {
                    throw new \RuntimeException('The source vault does not have enough expected cash for this transfer.');
                }

                $bankTransaction = $this->bankTransactionService->create($organizationId, $branchId, [
                    'bank_account_id' => $transfer->bank_account_id,
                    'type' => 'TRANSFER_IN',
                    'amount' => $transfer->amount,
                    'transaction_date' => now()->toDateString(),
                    'reference' => $transfer->transfer_no,
                    'description' => $transfer->note ?: 'Vault deposit to bank account',
                ]);
                $this->bankTransactionService->post($organizationId, $branchId, $bankTransaction->id, $userId);
                $sourceSession->update(['expected_cash' => $sourceExpected - $amount]);
                $transfer->bank_transaction_id = $bankTransaction->id;
            } else {
                $destinationSession = $this->openSessionForLocation($transfer->toCashLocation, $transfer->branch_day_id);
                $destinationExpected = (float) ($destinationSession->expected_cash ?? $destinationSession->opening_cash);
                $sourceSession = $this->openSessionForLocation($transfer->fromCashLocation, $transfer->branch_day_id);
                $sourceExpected = (float) ($sourceSession->expected_cash ?? $sourceSession->opening_cash);

                if ($sourceExpected < $amount) {
                    throw new \RuntimeException('The source session does not have enough expected cash for this transfer.');
                }

                $sourceSession->update(['expected_cash' => $sourceExpected - $amount]);
                $destinationSession->update(['expected_cash' => $destinationExpected + $amount]);
            }

            $transfer->update([
                'status' => 'COMPLETED',
                'completed_at' => now(),
            ]);

            return $transfer->fresh();
        });
    }

    private function openSessionForLocation(CashLocation $location, int $branchDayId): TellerSession|VaultSession
    {
        $session = match ($location->type) {
            'TELLER' => TellerSession::query()
                ->where('branch_day_id', $branchDayId)
                ->where('status', 'OPEN')
                ->whereHas('teller', fn($teller) => $teller->where('cash_location_id', $location->id))
                ->lockForUpdate()
                ->first(),
            'VAULT' => VaultSession::query()
                ->where('branch_day_id', $branchDayId)
                ->where('status', 'OPEN')
                ->whereHas('vault', fn($vault) => $vault->where('cash_location_id', $location->id))
                ->lockForUpdate()
                ->first(),
            default => null,
        };

        if (!$session) {
            throw new \RuntimeException('Both source and destination must have open teller or vault sessions for this branch day.');
        }

        return $session;
    }
}
