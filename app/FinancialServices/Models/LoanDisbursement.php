<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanDisbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_account_id',
        'financial_transaction_id',
        'amount',
        'disbursed_at',
        'status',
        'created_by',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'disbursed_at' => 'date',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }
}