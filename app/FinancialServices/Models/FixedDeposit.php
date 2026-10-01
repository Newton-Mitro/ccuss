<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'principal_amount',
        'contractual_rate',
        'term_value',
        'term_unit',
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
        'term_value' => 'integer',
        'started_at' => 'date',
        'maturity_date' => 'date',
        'closed_at' => 'date',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }
}
