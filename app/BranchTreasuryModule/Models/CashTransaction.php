<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    protected $fillable = ['cash_drawer_id', 'amount', 'type', 'source_type', 'source_id', 'reference', 'transaction_date', 'remarks'];

    public function cashDrawer(): BelongsTo
    {
        return $this->belongsTo(CashDrawer::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}