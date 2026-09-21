<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'deposit_account_id',
        'principal_amount',
        'contractual_rate',
        'term_months',
        'started_at',
        'maturity_date',
        'maturity_amount',
        'maturity_instruction',
        'status',
        'closed_at',
        'closure_reason',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:4',
        'contractual_rate' => 'decimal:6',
        'maturity_amount' => 'decimal:4',
        'started_at' => 'date',
        'maturity_date' => 'date',
        'closed_at' => 'date',
    ];

    public function depositAccount(): BelongsTo
    {
        return $this->belongsTo(DepositAccount::class);
    }
}
