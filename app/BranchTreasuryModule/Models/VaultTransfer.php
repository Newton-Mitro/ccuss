<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultTransfer extends Model
{
    protected $fillable = [
        'from_vault_id',
        'to_vault_id',
        'amount',
        'transfer_date',
        'approved_by',
        'remarks'
    ];

    public function fromVault(): BelongsTo
    {
        return $this->belongsTo(Vault::class, 'from_vault_id');
    }

    public function toVault(): BelongsTo
    {
        return $this->belongsTo(Vault::class, 'to_vault_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}