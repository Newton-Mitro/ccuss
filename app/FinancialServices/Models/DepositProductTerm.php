<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositProductTerm extends Model
{
    protected $fillable = [
        'deposit_product_id',
        'code',
        'name',
        'tenure_value',
        'tenure_unit',
        'interest_rate',
        'interest_calculation',
        'interest_frequency',
        'minimum_amount',
        'maximum_amount',
        'rules',
        'status',
        'effective_from',
        'effective_until',
    ];

    protected $casts = [
        'interest_rate' => 'decimal:6',
        'minimum_amount' => 'decimal:4',
        'maximum_amount' => 'decimal:4',
        'rules' => 'array',
        'status' => 'boolean',
        'effective_from' => 'date',
        'effective_until' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(DepositProduct::class, 'deposit_product_id');
    }
}