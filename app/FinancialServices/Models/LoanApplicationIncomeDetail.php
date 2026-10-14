<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationIncomeDetail extends Model
{
    protected $table = 'loan_application_income_details';

    protected $fillable = ['source', 'monthly_amount', 'notes'];

    protected $casts = ['monthly_amount' => 'decimal:2'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}