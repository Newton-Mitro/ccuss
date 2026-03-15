<?php

namespace App\CashTreasuryModule\Models;

use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vault extends Model
{
    protected $fillable = ['branch_id', 'name', 'total_balance', 'is_active'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vaultDenominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(VaultTransaction::class);
    }
}