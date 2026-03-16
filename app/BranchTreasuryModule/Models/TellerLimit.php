<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TellerLimit extends Model
{
    protected $fillable = ['teller_id', 'max_cash_limit', 'max_transaction_limit'];

    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }
}