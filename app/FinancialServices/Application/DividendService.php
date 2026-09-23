<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\ShareAccount;
use App\FinancialServices\Models\ShareDividendDeclaration;
use App\FinancialServices\Models\ShareDividendAllocation;
use App\FinancialServices\Application\FinancialTransactionService;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DividendService
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
    }

    public function createDeclaration(array $data, int $organizationId): ShareDividendDeclaration
    {
        $fiscalYear = FiscalYear::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($data['fiscal_year_id']);
        if ((float) $data['dividend_rate'] < 0) {
            throw new RuntimeException('Dividend rate cannot be negative.');
        }
        if (ShareDividendDeclaration::query()->where('organization_id', $organizationId)->where('fiscal_year_id', $fiscalYear->id)->exists()) {
            throw new RuntimeException('A dividend declaration already exists for this fiscal year.');
        }

        $next = ((int) ShareDividendDeclaration::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return ShareDividendDeclaration::create([
            'organization_id' => $organizationId,
            'fiscal_year_id' => $fiscalYear->id,
            'declaration_no' => sprintf('DIV-%06d', $next),
            'declaration_date' => $data['declaration_date'] ?? now()->toDateString(),
            'dividend_rate' => $data['dividend_rate'],
            'status' => 'DRAFT',
            'note' => $data['note'] ?? null,
        ]);
    }

    public function calculate(ShareDividendDeclaration $declaration): ShareDividendDeclaration
    {
        if ($declaration->status !== 'DRAFT') {
            throw new RuntimeException('Only draft dividend declarations can be calculated.');
        }
        $declaration->loadMissing('organization');
        $fiscalYear = FiscalYear::query()->findOrFail($declaration->fiscal_year_id);
        return DB::transaction(function () use ($declaration): ShareDividendDeclaration {
            $declaration->allocations()->delete();
            $basisTotal = 0.0;
            $dividendTotal = 0.0;
            ShareAccount::query()
                ->where('membership_status', 'ACTIVE')
                ->whereHas('financialAccount', fn($query) => $query
                    ->where('organization_id', $declaration->organization_id)
                    ->where('account_type', 'SHARE')
                    ->whereIn('status', ['PENDING', 'ACTIVE']))
                ->with('financialAccount')
                ->each(function (ShareAccount $shareAccount) use ($declaration, &$basisTotal, &$dividendTotal): void {
                    $basis = max(0, (float) ($shareAccount->financialAccount->available_balance ?? $shareAccount->financialAccount->balance));
                    $amount = round($basis * (float) $declaration->dividend_rate / 100, 4);
                    if ($basis <= 0 || $amount <= 0) {
                        return;
                    }
                    $declaration->allocations()->create([
                        'share_account_id' => $shareAccount->id,
                        'basis_amount' => $basis,
                        'dividend_rate' => $declaration->dividend_rate,
                        'dividend_amount' => $amount,
                        'status' => 'CALCULATED',
                    ]);
                    $basisTotal += $basis;
                    $dividendTotal += $amount;
                });

            $declaration->update(['total_basis_amount' => round($basisTotal, 4), 'total_dividend_amount' => round($dividendTotal, 4)]);

            return $declaration->fresh('allocations');
        });
    }

    public function approve(ShareDividendDeclaration $declaration, int $userId): ShareDividendDeclaration
    {
        if ($declaration->status !== 'DRAFT' || $declaration->allocations()->doesntExist()) {
            throw new RuntimeException('Only calculated dividend declarations can be approved.');
        }
        $declaration->update(['status' => 'APPROVED', 'approved_by' => $userId, 'approved_at' => now()]);

        return $declaration->refresh();
    }

    public function createPosting(ShareDividendAllocation $allocation, int $organizationId, int $userId): \App\FinancialServices\Models\FinancialTransaction
    {
        if ($allocation->status !== 'CALCULATED' || $allocation->declaration()->value('status') !== 'APPROVED') {
            throw new RuntimeException('Only approved dividend allocations can be posted.');
        }
        $allocation->loadMissing('shareAccount.financialAccount');

        return $this->transactionService->create([
            'financial_account_id' => $allocation->shareAccount->financial_account_id,
            'transaction_type' => 'DIVIDEND_ALLOCATION',
            'transaction_date' => now()->toDateString(),
            'amount' => $allocation->dividend_amount,
            'idempotency_key' => 'dividend-allocation-' . $allocation->id,
            'source_type' => ShareDividendAllocation::class,
            'source_id' => $allocation->id,
            'description' => 'Share dividend allocation',
        ], $organizationId, $userId);
    }
}