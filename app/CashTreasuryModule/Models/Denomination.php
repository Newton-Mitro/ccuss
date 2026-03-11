<?php

namespace App\CashTreasuryModule\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Denomination extends Model
{
    protected $fillable = ['value', 'is_active'];

    public function vaultDenominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }
}