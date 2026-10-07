<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanPolicy extends Model
{
    protected $fillable = [
        'loan_product_id',
        'financial_product_id',
        'customer_can_open_multiple_account',
        'maximum_loan_amount',
        'loan_to_value_percent',
        'interest_rebate_percent',
        'loan_ceiling_rules',
        'repayment_rules',
        'eligibility_rules',
        'security_rules',
        'documentation_requirements',
        'source_url',
        'source_checked_at',
        'effective_from',
        'effective_until',
        'version',
        'status',
        'notes',
    ];

    protected $casts = [
        'maximum_loan_amount' => 'decimal:4',
        'loan_to_value_percent' => 'decimal:4',
        'interest_rebate_percent' => 'decimal:4',
        'customer_can_open_multiple_account' => 'boolean',
        'loan_ceiling_rules' => 'array',
        'repayment_rules' => 'array',
        'eligibility_rules' => 'array',
        'security_rules' => 'array',
        'documentation_requirements' => 'array',
        'source_checked_at' => 'date',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(LoanProduct::class, 'loan_product_id');
    }

    public function setFinancialProductIdAttribute($value): void
    {
        $this->attributes['loan_product_id'] = $value;
    }

    public function getFinancialProductIdAttribute(): ?int
    {
        return $this->loan_product_id;
    }
}