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

    /**
     * Vault involved in the transfer
     */
    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    /**
     * Teller session involved in the transfer
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }
}