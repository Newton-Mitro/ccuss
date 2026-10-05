<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\User;
use App\FinancialServices\Models\FinancialTransaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TellerCashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_day_id',
        'cash_location_id',
        'teller_session_id',
        'financial_transaction_id',
        'transaction_no',
        'type',
        'amount',
        'status',
        'reference',
        'note',
        'requested_by',
        'posted_by',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
        'reversed_by',
        'reversed_at',
        'reversal_reason',
        'requested_at',
        'posted_at',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'requested_at' => 'datetime',
        'posted_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'reversed_at' => 'datetime',
    ];

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function cashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class);
    }

    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function reversedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reversed_by');
    }
}
