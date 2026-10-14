<?php

namespace App\FinancialServices\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanProtectionClaim extends Model
{
    protected $fillable = [
        'loan_account_id',
        'claim_no',
        'death_date',
        'death_certificate_path',
        'death_certificate_name',
        'status',
        'payout_amount',
        'payout_account_id',
        'financial_transaction_id',
        'submitted_by',
        'reviewed_by',
        'reviewed_at',
        'decision_note',
    ];

    protected $hidden = ['death_certificate_path'];

    protected $casts = [
        'death_date' => 'date',
        'payout_amount' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function payoutAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'payout_account_id');
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}