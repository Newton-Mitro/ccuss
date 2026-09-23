<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\LoanRepaymentAllocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanRepayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_account_id',
        'financial_transaction_id',
        'amount',
        'repayment_date',
        'status',
        'reference',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'repayment_date' => 'date',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function financialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(LoanRepaymentAllocation::class);
    }
}
