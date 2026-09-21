<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanProtectionPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_account_id',
        'required',
        'coverage_amount',
        'initial_fee',
        'renewal_fee',
        'renewal_frequency',
        'next_renewal_at',
        'status',
    ];

    protected $casts = [
        'required' => 'boolean',
        'coverage_amount' => 'decimal:4',
        'initial_fee' => 'decimal:4',
        'renewal_fee' => 'decimal:4',
        'next_renewal_at' => 'date',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }
}
