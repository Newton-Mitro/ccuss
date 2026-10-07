<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositPolicy extends Model
{
    protected $fillable = [
        'deposit_product_id',
        'financial_product_id',
        'customer_can_open_multiple_account',
        'minimum_opening_amount',
        'minimum_deposit_amount',
        'maximum_deposit_amount',
        'interest_rebate_percent',
        'deposit_amount_rules',
        'tenure_rules',
        'eligibility_rules',
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
        'interest_rebate_percent' => 'decimal:4',
        'customer_can_open_multiple_account' => 'boolean',
        'deposit_amount_rules' => 'array',
        'tenure_rules' => 'array',
        'eligibility_rules' => 'array',
        'documentation_requirements' => 'array',
        'maturity_examples' => 'array',
        'source_checked_at' => 'date',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(DepositProduct::class, 'deposit_product_id');
    }

    public function setFinancialProductIdAttribute($value): void
    {
        $this->attributes['deposit_product_id'] = $value;
    }

    public function getFinancialProductIdAttribute(): ?int
    {
        return $this->deposit_product_id;
    }
}