<?php

namespace App\TreasuryAndCash\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchCashSummary extends Model
{
    use HasFactory;

    protected $fillable = ['branch_day_id', 'opening_cash', 'cash_received', 'cash_paid', 'vault_balance', 'teller_balance', 'petty_cash_balance', 'closing_cash', 'cash_difference'];

    protected $casts = ['opening_cash' => 'decimal:4', 'cash_received' => 'decimal:4', 'cash_paid' => 'decimal:4', 'vault_balance' => 'decimal:4', 'teller_balance' => 'decimal:4', 'petty_cash_balance' => 'decimal:4', 'closing_cash' => 'decimal:4', 'cash_difference' => 'decimal:4'];

    public function branchDay(): BelongsTo
    {
        return $this->belongsTo(BranchDay::class);
    }
}