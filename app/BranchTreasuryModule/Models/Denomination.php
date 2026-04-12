<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Denomination extends Model
{
    use HasFactory, Auditable;
    protected $fillable = ['value', 'is_active'];

    public function vaultDenominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }
}