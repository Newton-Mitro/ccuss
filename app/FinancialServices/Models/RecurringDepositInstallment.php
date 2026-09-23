<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringDepositInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'recurring_deposit_id',
        'financial_transaction_id',
        'installment_no',
        'due_date',
        'amount_due',
        'amount_paid',
        'fine_amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'amount_due' => 'decimal:4',
        'amount_paid' => 'decimal:4',
        'fine_amount' => 'decimal:4',
        'paid_at' => 'datetime',
    ];

    public function recurringDeposit(): BelongsTo
    {
        return $this->belongsTo(RecurringDeposit::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }
}
