<?php

namespace App\FinancialServices\Models;

use App\FinancialServices\Models\InterestPosting;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InterestProvision extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'financial_product_id',
        'period_start',
        'period_end',
        'calculated_at',
        'basis_amount',
        'annual_rate',
        'provisioned_amount',
        'status',
        'financial_transaction_id',
        'calculated_by',
        'approved_by',
        'approved_at',
        'note',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'calculated_at' => 'date',
        'basis_amount' => 'decimal:4',
        'annual_rate' => 'decimal:6',
        'provisioned_amount' => 'decimal:4',
        'approved_at' => 'datetime',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FinancialProduct::class, 'financial_product_id');
    }

    public function posting(): HasOne
    {
        return $this->hasOne(InterestPosting::class);
    }
}
