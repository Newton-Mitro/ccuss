<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    protected $fillable = [
        'teller_session_id',
        'amount',
        'type',
        'source_type',
        'source_id',
        'reference',
        'transaction_date',
        'remarks'
    ];

    /**
     * Link transaction to a teller session
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }

    /**
     * Polymorphic relation for the source (e.g., deposit, withdrawal, adjustment)
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}