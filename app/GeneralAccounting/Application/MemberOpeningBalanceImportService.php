<?php

namespace App\GeneralAccounting\Application;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class MemberOpeningBalanceImportService
{
    private const ACCOUNT_TYPES = ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'];

    public function __construct(
        private readonly OpeningBalanceService $openingBalanceService,
    ) {}

    public function import(
        UploadedFile $file,
        int $organizationId,
        int $userId,
        int $fiscalPeriodId,
        int $offsetAccountId,
        string $cutoverDate,
    ): array {
        $rows = $this->readCsv($file);
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId))
            ->findOrFail($fiscalPeriodId);

        if ($period->status !== 'OPEN') {
            throw new RuntimeException('Opening balances can only be imported into an open fiscal period.');
        }

        if ($cutoverDate < $period->start_date->toDateString() || $cutoverDate > $period->end_date->toDateString()) {
            throw new InvalidArgumentException('The cutover date must be within the selected fiscal period.');
        }

        return DB::transaction(function () use ($rows, $organizationId, $userId, $fiscalPeriodId, $offsetAccountId, $cutoverDate): array {
            $accountNumbers = collect($rows)->pluck('account_no')->all();
            $accounts = FinancialAccount::query()
                ->with(['holder', 'savingAccount', 'shareAccount', 'fixedDeposit', 'recurringDeposit'])
                ->where('organization_id', $organizationId)
                ->whereIn('account_no', $accountNumbers)
                ->lockForUpdate()
                ->get()
                ->keyBy('account_no');

            $ledgerCodes = collect($rows)->pluck('ledger_account_code')->unique()->all();
            $ledgerAccounts = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->whereIn('code', $ledgerCodes)
                ->get()
                ->keyBy('code');

            $openingEntries = [];
            $importRows = [];
            foreach ($rows as $index => $row) {
                $line = $index + 2;
                $account = $accounts->get($row['account_no']);
                if (! $account) {
                    throw new InvalidArgumentException("CSV line {$line}: financial account {$row['account_no']} was not found in this organization.");
                }

                if (! in_array($account->account_type, self::ACCOUNT_TYPES, true)) {
                    if (in_array($account->account_type, ['LOAN', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true)) {
                        throw new InvalidArgumentException("CSV line {$line}: {$account->account_type} contract history and schedules require a separate migration phase.");
                    }

                    throw new InvalidArgumentException("CSV line {$line}: {$account->account_type} accounts are not supported by the member opening-balance import.");
                }

                if ($account->holder_type !== Customer::class || $account->holder?->organization_id !== $organizationId) {
                    throw new InvalidArgumentException("CSV line {$line}: account {$account->account_no} is not a member-owned account.");
                }

                $hasRequiredDetails = match ($account->account_type) {
                    'SAVINGS' => $account->savingAccount !== null,
                    'SHARE' => $account->shareAccount !== null,
                    'FIXED_DEPOSIT' => $account->fixedDeposit !== null,
                    'RECURRING_DEPOSIT' => $account->recurringDeposit !== null,
                    default => false,
                };
                if (! $hasRequiredDetails) {
                    throw new InvalidArgumentException("CSV line {$line}: account {$account->account_no} is missing its account-type details.");
                }

                if ($account->account_type === 'SHARE' && $account->shareAccount->membership_status !== 'ACTIVE') {
                    throw new InvalidArgumentException("CSV line {$line}: share membership for {$account->account_no} must be active before importing its balance.");
                }

                if ($account->status !== 'ACTIVE') {
                    throw new InvalidArgumentException("CSV line {$line}: account {$account->account_no} must be active before importing an opening balance.");
                }

                if ((float) $account->balance !== 0.0 || (float) $account->available_balance !== 0.0) {
                    throw new InvalidArgumentException("CSV line {$line}: account {$account->account_no} already has a balance.");
                }

                if ($account->transactions()->exists()) {
                    throw new InvalidArgumentException("CSV line {$line}: account {$account->account_no} already has transaction history.");
                }

                $ledgerAccount = $ledgerAccounts->get($row['ledger_account_code']);
                if (! $ledgerAccount) {
                    throw new InvalidArgumentException("CSV line {$line}: active ledger account {$row['ledger_account_code']} was not found in this organization.");
                }

                $expectedLedgerType = $account->account_type === 'SHARE' ? 'EQUITY' : 'LIABILITY';
                if ($ledgerAccount->normal_balance !== 'CREDIT' || $ledgerAccount->type !== $expectedLedgerType) {
                    throw new InvalidArgumentException("CSV line {$line}: {$account->account_type} balances must map to a credit-normal {$expectedLedgerType} account.");
                }

                if ((int) $ledgerAccount->id === $offsetAccountId) {
                    throw new InvalidArgumentException("CSV line {$line}: the offset account cannot also be used as a member-balance control account.");
                }

                $openingEntries[] = [
                    'account_id' => $ledgerAccount->id,
                    'amount' => $row['opening_balance'],
                    'description' => "Member opening balance {$account->account_no}",
                ];
                $importRows[] = [$account, $row['opening_balance']];
            }

            $total = round(collect($importRows)->sum(fn (array $row): float => (float) $row[1]), 2);
            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'transaction_no' => 'OPENING-'.Str::uuid(),
                'idempotency_key' => Str::uuid(),
                'transaction_type' => 'OPENING_BALANCE',
                'transaction_date' => $cutoverDate,
                'amount' => $total,
                'currency' => 'BDT',
                'status' => 'POSTED',
                'description' => 'Member opening balance import',
                'created_by' => $userId,
                'posted_by' => $userId,
                'posted_at' => now(),
            ]);
            $transactionEntries = [];
            foreach ($importRows as $index => [$account, $amount]) {
                $account->update([
                    'balance' => $amount,
                    'available_balance' => $amount,
                    'opened_at' => $account->opened_at ?? $cutoverDate,
                    'last_operated_at' => $cutoverDate,
                ]);

                $transactionEntries[] = [
                    'financial_account_id' => $account->id,
                    'direction' => 'CREDIT',
                    'amount' => $amount,
                    'balance_after' => $amount,
                    'description' => 'Opening balance at cutover',
                    'line_no' => $index + 1,
                ];
            }
            $transaction->entries()->createMany($transactionEntries);

            $voucher = $this->openingBalanceService->apply(
                $openingEntries,
                $organizationId,
                $userId,
                $fiscalPeriodId,
                $offsetAccountId,
                $cutoverDate,
                $transaction->id,
            );

            return [
                'count' => count($importRows),
                'voucher' => $voucher,
            ];
        });
    }

    private function readCsv(UploadedFile $file): array
    {
        $stream = fopen($file->getRealPath(), 'r');
        if ($stream === false) {
            throw new RuntimeException('The uploaded CSV file could not be opened.');
        }

        try {
            $header = fgetcsv($stream, null, ',', '"', '');
            if (! is_array($header)) {
                throw new InvalidArgumentException('The CSV file is empty.');
            }

            $header[0] = ltrim((string) $header[0], "\xEF\xBB\xBF");
            $header = array_map(fn ($value) => strtolower(trim((string) $value)), $header);
            $required = ['account_no', 'opening_balance', 'ledger_account_code'];
            if (count(array_unique($header)) !== count($header)) {
                throw new InvalidArgumentException('CSV headers must not contain duplicate columns.');
            }

            if (array_diff($required, $header) !== []) {
                throw new InvalidArgumentException('CSV headers must include account_no, opening_balance, and ledger_account_code.');
            }

            $positions = array_flip($header);
            $rows = [];
            $line = 1;
            while (($values = fgetcsv($stream, null, ',', '"', '')) !== false) {
                $line++;
                if ($values === [null] || collect($values)->every(fn ($value) => trim((string) $value) === '')) {
                    continue;
                }

                if (count($values) !== count($header)) {
                    throw new InvalidArgumentException("CSV line {$line}: the number of columns does not match the header.");
                }

                $accountNo = trim((string) $values[$positions['account_no']]);
                $balance = trim((string) $values[$positions['opening_balance']]);
                $ledgerCode = trim((string) $values[$positions['ledger_account_code']]);

                if ($accountNo === '' || $ledgerCode === '' || ! preg_match('/^\d+(?:\.\d{1,2})?$/D', $balance) || (float) $balance <= 0) {
                    throw new InvalidArgumentException("CSV line {$line}: provide an account number, a positive balance with up to two decimals, and a ledger account code.");
                }

                if (isset($rows[$accountNo])) {
                    throw new InvalidArgumentException("CSV line {$line}: account {$accountNo} appears more than once.");
                }

                $rows[$accountNo] = [
                    'account_no' => $accountNo,
                    'opening_balance' => round((float) $balance, 2),
                    'ledger_account_code' => $ledgerCode,
                ];

                if (count($rows) > 5000) {
                    throw new InvalidArgumentException('A single opening-balance import cannot contain more than 5,000 accounts.');
                }
            }

            if ($rows === []) {
                throw new InvalidArgumentException('The CSV file contains no account balances to import.');
            }

            return array_values($rows);
        } finally {
            fclose($stream);
        }
    }
}
