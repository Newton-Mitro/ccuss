<?php

namespace App\CashTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultDenomination extends Model
{
    protected $fillable = ['vault_id', 'denomination_id', 'count'];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function denomination(): BelongsTo
    {
        return $this->belongsTo(Denomination::class);
    }
}