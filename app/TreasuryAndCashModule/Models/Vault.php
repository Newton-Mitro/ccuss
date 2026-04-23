<?php

namespace App\TreasuryAndCashModule\Models;

use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vault extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'subledger_account_id',
        'name',
        'is_active'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
    }

    public function denominations(): HasMany
    {
        return $this->hasMany(VaultDenomination::class);
    }
}