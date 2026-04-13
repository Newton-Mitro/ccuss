<?php

namespace App\BranchTreasuryModule\Models;

use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vault extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'branch_id',
        'account_id',
        'name',
        'is_active'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function denominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }
}