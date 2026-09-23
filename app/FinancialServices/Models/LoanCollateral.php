<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanCollateral extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_application_id',
        'loan_account_id',
        'type',
        'description',
        'assessed_value',
        'secured_value',
        'status',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'assessed_value' => 'decimal:4',
        'secured_value' => 'decimal:4',
        'verified_at' => 'date',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class, 'loan_application_id');
    }

    public function loanAccount(): BelongsTo
    {
        return $this->belongsTo(LoanAccount::class);
    }
}
