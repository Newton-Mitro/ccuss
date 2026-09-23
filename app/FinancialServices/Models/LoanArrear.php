<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanArrear extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_account_id',
        'loan_schedule_id',
        'as_of_date',
        'days_overdue',
        'principal_overdue',
        'interest_overdue',
        'fee_overdue',
        'total_overdue',
        'status',
        'resolution_type',
        'resolution_note',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'as_of_date' => 'date',
        'principal_overdue' => 'decimal:4',
        'interest_overdue' => 'decimal:4',
        'fee_overdue' => 'decimal:4',
        'total_overdue' => 'decimal:4',
        'resolved_at' => 'datetime',
    ];

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(LoanSchedule::class, 'loan_schedule_id');
    }
}
