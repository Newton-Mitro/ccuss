<?php

namespace App\TreasuryAndCashModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Denomination extends Model
{
    use HasFactory, Auditable, SoftDeletes;
    protected $fillable = ['value', 'is_active'];

    public function vaultDenominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }
}