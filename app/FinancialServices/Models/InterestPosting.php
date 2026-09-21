<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterestPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'interest_provision_id',
        'financial_transaction_id',
        'amount',
        'posted_at',
        'status',
        'posted_by',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'posted_at' => 'date',
    ];

    public function provision(): BelongsTo
    {
        return $this->belongsTo(InterestProvision::class, 'interest_provision_id');
    }
}
