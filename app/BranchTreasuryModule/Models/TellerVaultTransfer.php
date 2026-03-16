<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TellerVaultTransfer extends Model
{
    protected $fillable = [
        'vault_id',
        'teller_session_id',
        'amount',
        'type',
        'transfer_date'
    ];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }
}