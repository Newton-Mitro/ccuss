<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vault extends Model
{
    use HasFactory, Auditable;
    protected $fillable = ['branch_id', 'name', 'total_balance', 'is_active'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vaultDenominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }

    public function voucher_entries(): HasMany
    {
        return $this->hasMany(VaultTransaction::class);
    }
}