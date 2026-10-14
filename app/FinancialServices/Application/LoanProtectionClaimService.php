<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\LoanProtectionClaim;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class LoanProtectionClaimService
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
    }

    public function submit(LoanApplication $application, array $data, int $userId): LoanProtectionClaim
    {
        $file = $data['death_certificate'] ?? null;
        if (!$file instanceof UploadedFile) {
            throw new RuntimeException('A death certificate is required.');
        }

        $loan = $application->loanAccount()->with('protectionPolicy')->firstOrFail();
        if (!$loan->protectionPolicy || $loan->protectionPolicy->status !== 'ACTIVE') {
            throw new RuntimeException('An active credit-life policy is required to submit a claim.');
        }
        if ($loan->protectionClaims()->whereIn('status', ['SUBMITTED', 'APPROVED'])->exists()) {
            throw new RuntimeException('An open claim already exists for this loan.');
        }

        $path = $file->store("loan-protection-claims/{$loan->id}", 'local');

        try {
            return DB::transaction(function () use ($application, $loan, $data, $userId, $file, $path): LoanProtectionClaim {
                $lockedLoan = $loan->newQuery()->lockForUpdate()->findOrFail($loan->id);
                $claimNumber = sprintf(
                    'LC-%08d-%03d',
                    $lockedLoan->id,
                    $lockedLoan->protectionClaims()->count() + 1,
                );

                return $lockedLoan->protectionClaims()->create([
                    'claim_no' => $claimNumber,
                    'death_date' => $data['death_date'],
                    'death_certificate_path' => $path,
                    'death_certificate_name' => $file->getClientOriginalName(),
                    'status' => 'SUBMITTED',
                    'submitted_by' => $userId,
                    'decision_note' => $data['notes'] ?? null,
                ]);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }
    }

    public function approve(
        LoanApplication $application,
        LoanProtectionClaim $claim,
        array $data,
        int $organizationId,
        int $userId,
    ): LoanProtectionClaim {
        $this->ensureClaimBelongsToApplication($application, $claim);

        if ($claim->status !== 'SUBMITTED') {
            throw new RuntimeException('Only submitted credit-life claims can be approved.');
        }

        $this->transactionService->createLoanProtectionClaimPayout(
            $claim,
            (int) $data['payout_account_id'],
            $organizationId,
            $userId,
            $data['decision_note'] ?? null,
        );

        return $claim->refresh();
    }

    public function reject(
        LoanApplication $application,
        LoanProtectionClaim $claim,
        string $decisionNote,
        int $userId,
    ): LoanProtectionClaim {
        $this->ensureClaimBelongsToApplication($application, $claim);
        if ($claim->status !== 'SUBMITTED') {
            throw new RuntimeException('Only submitted credit-life claims can be rejected.');
        }

        $claim->update([
            'status' => 'REJECTED',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
            'decision_note' => $decisionNote,
        ]);

        return $claim->refresh();
    }

    private function ensureClaimBelongsToApplication(LoanApplication $application, LoanProtectionClaim $claim): void
    {
        if ($claim->loanAccount?->loan_application_id !== $application->id) {
            abort(404);
        }
    }
}