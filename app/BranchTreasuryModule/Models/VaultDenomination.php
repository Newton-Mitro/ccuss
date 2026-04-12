<?php

namespace App\BranchTreasuryModule\Models;

use App\SystemAdministration\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultDenomination extends Model
{
    use HasFactory, Auditable;
    protected $fillable = ['vault_id', 'denomination_id', 'count'];

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }

    public function denomination(): BelongsTo
    {
        return $this->belongsTo(Denomination::class);
    }
}