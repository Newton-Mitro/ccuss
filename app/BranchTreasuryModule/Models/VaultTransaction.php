<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultTransaction extends Model
{
    protected $fillable = ['vault_id', 'teller_id', 'amount', 'type', 'reference', 'transaction_date', 'remarks'];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }
}