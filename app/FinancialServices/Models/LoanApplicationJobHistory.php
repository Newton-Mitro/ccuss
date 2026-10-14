<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationJobHistory extends Model
{
    protected $table = 'loan_application_job_histories';

    protected $fillable = [
        'employer_name',
        'job_title',
        'employment_type',
        'start_date',
        'end_date',
        'monthly_income',
        'is_current',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_income' => 'decimal:2',
        'is_current' => 'boolean',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}