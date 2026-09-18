<?php

namespace App\TreasuryAndCash\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_day_id',
        'from_cash_location_id',
        'to_cash_location_id',
        'amount',
        'transfer_no',
        'status',
        'requested_by',
        'approved_by',
        'requested_at',
        'completed_at',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'requested_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }

    public function fromCashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class, 'from_cash_location_id');
    }

    public function toCashLocation(): BelongsTo
    {
        return $this->belongsTo(CashLocation::class, 'to_cash_location_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
