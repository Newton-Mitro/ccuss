<?php

namespace App\BranchTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultTransaction extends Model
{
    protected $fillable = [
        'vault_id',
        'teller_id',
        'teller_session_id', // added to link transactions to session
        'amount',
        'type',
        'reference',
        'transaction_date',
        'remarks'
    ];

    /**
     * Vault involved in the transaction
     */
    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    /**
     * Teller performing the transaction
     */
    public function teller(): BelongsTo
    {
        return $this->belongsTo(Teller::class);
    }

    /**
     * Teller session this transaction belongs to
     */
    public function tellerSession(): BelongsTo
    {
        return $this->belongsTo(TellerSession::class);
    }
}