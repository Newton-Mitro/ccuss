<?php

namespace App\FinancialServices\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountFine extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'account_default_event_id',
        'financial_transaction_id',
        'assessed_at',
        'base_amount',
        'rate',
        'assessed_amount',
        'waived_amount',
        'status',
        'assessed_by',
        'waived_by',
        'waived_at',
        'note',
    ];

    protected $casts = [
        'assessed_at' => 'date',
        'base_amount' => 'decimal:4',
        'rate' => 'decimal:6',
        'assessed_amount' => 'decimal:4',
        'waived_amount' => 'decimal:4',
        'waived_at' => 'datetime',
    ];

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function defaultEvent(): BelongsTo
    {
        return $this->belongsTo(AccountDefaultEvent::class, 'account_default_event_id');
    }
}
