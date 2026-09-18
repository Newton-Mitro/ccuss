<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TellerSession extends Model
{
    protected $fillable = ['branch_day_id', 'teller_id', 'opened_by', 'closed_by', 'status', 'opening_cash', 'closing_cash', 'expected_cash', 'cash_difference', 'opened_at', 'closed_at'];
    protected $casts = ['opening_cash' => 'decimal:4', 'closing_cash' => 'decimal:4', 'expected_cash' => 'decimal:4', 'cash_difference' => 'decimal:4', 'opened_at' => 'datetime', 'closed_at' => 'datetime'];
    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }
    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }
}
