<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\TreasuryAndCash\Models\CashCountDenomination;

class CashCount extends Model
{
    use HasFactory;

    protected $fillable = ['branch_day_id', 'cash_location_id', 'teller_session_id', 'type', 'total_amount', 'counted_by', 'counted_at', 'note'];

    protected $casts = ['total_amount' => 'decimal:4', 'counted_at' => 'datetime'];

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
    public function denominations(): HasMany
    {
        return $this->hasMany(CashCountDenomination::class);
    }
}