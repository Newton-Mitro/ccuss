<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\RecurringDepositInstallment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'installment_amount',
        'installment_frequency',
        'total_installments',
        'paid_installments',
        'started_at',
        'maturity_date',
        'maturity_extension_days',
        'grace_days',
        'status',
        'closed_at',
        'closure_reason',
    ];

    protected $casts = [
        'installment_amount' => 'decimal:4',
        'started_at' => 'date',
        'maturity_date' => 'date',
        'closed_at' => 'date',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(RecurringDepositInstallment::class);
    }
}
