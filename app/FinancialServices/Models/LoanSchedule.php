<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\LoanRepaymentAllocation;
use App\FinancialServices\Models\LoanScheduleComponent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_account_id',
        'schedule_version',
        'installment_no',
        'due_date',
        'opening_principal',
        'scheduled_principal',
        'scheduled_interest',
        'scheduled_fee',
        'scheduled_protection_fee',
        'total_due',
        'total_paid',
        'status',
        'generation_inputs',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'schedule_version' => 'integer',
        'opening_principal' => 'decimal:4',
        'scheduled_principal' => 'decimal:4',
        'scheduled_interest' => 'decimal:4',
        'scheduled_fee' => 'decimal:4',
        'scheduled_protection_fee' => 'decimal:4',
        'total_due' => 'decimal:4',
        'total_paid' => 'decimal:4',
        'paid_at' => 'datetime',
        'generation_inputs' => 'array',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function components(): HasMany
    {
        return $this->hasMany(LoanScheduleComponent::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(LoanRepaymentAllocation::class);
    }
}
