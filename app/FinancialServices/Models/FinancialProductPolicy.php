<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\FinancialServices\Models\FinancialProduct;

class FinancialProductPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_product_id',
        'minimum_opening_amount',
        'minimum_deposit_amount',
        'maximum_deposit_amount',
        'maximum_loan_amount',
        'loan_to_value_percent',
        'interest_rebate_percent',
        'deposit_amount_rules',
        'tenure_rules',
        'loan_ceiling_rules',
        'repayment_rules',
        'eligibility_rules',
        'security_rules',
        'documentation_requirements',
        'maturity_examples',
        'source_url',
        'source_checked_at',
        'effective_from',
        'effective_until',
        'version',
        'status',
        'notes',
    ];

    protected $casts = [
        'minimum_opening_amount' => 'decimal:4',
        'minimum_deposit_amount' => 'decimal:4',
        'maximum_deposit_amount' => 'decimal:4',
        'maximum_loan_amount' => 'decimal:4',
        'loan_to_value_percent' => 'decimal:4',
        'interest_rebate_percent' => 'decimal:4',
        'deposit_amount_rules' => 'array',
        'tenure_rules' => 'array',
        'loan_ceiling_rules' => 'array',
        'repayment_rules' => 'array',
        'eligibility_rules' => 'array',
        'security_rules' => 'array',
        'documentation_requirements' => 'array',
        'maturity_examples' => 'array',
        'source_checked_at' => 'date',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }
}