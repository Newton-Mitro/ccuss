<?php

namespace App\BranchTreasuryModule\Models;

use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultDenomination extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'vault_id',
        'account_id',
        'denomination_id',
        'count'
    ];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function denomination(): BelongsTo
    {
        return $this->belongsTo(Denomination::class);
    }

    // 💡 Helper: total value per row
    public function getTotalAmountAttribute(): int
    {
        return $this->count * $this->denomination->value;
    }
}