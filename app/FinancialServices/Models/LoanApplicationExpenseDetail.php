<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApplicationExpenseDetail extends Model
{
    protected $table = 'loan_application_expense_details';

    protected $fillable = ['category', 'monthly_amount', 'notes'];

    protected $casts = ['monthly_amount' => 'decimal:2'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }
}