<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanScheduleComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_schedule_id',
        'type',
        'amount_due',
        'amount_paid',
        'status',
    ];

    protected $casts = [
        'amount_due' => 'decimal:4',
        'amount_paid' => 'decimal:4',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(LoanSchedule::class, 'loan_schedule_id');
    }
}
