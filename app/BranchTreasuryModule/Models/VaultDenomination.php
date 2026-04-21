<?php

namespace App\BranchTreasuryModule\Models;


use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaultDenomination extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'vault_id',
        'subledger_account_id',
        'denomination_id',
        'count'
    ];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function subledgerAccount(): BelongsTo
    {
        return $this->belongsTo(SubledgerAccount::class);
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