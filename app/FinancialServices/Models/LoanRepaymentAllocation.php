<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanRepaymentAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_repayment_id',
        'loan_schedule_id',
        'loan_schedule_component_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
    ];

    public function repayment(): BelongsTo
    {
        return $this->belongsTo(LoanRepayment::class, 'loan_repayment_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(LoanSchedule::class, 'loan_schedule_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(LoanScheduleComponent::class, 'loan_schedule_component_id');
    }
}
